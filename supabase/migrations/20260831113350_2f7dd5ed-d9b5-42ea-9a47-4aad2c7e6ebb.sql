
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('owner','editor','author','contributor','subscriber');
CREATE TYPE public.post_status AS ENUM ('draft','in_review','scheduled','published','archived');
CREATE TYPE public.comment_status AS ENUM ('pending','approved','spam');

-- UPDATED_AT helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'subscriber',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('owner','editor','author','contributor'));
$$;

CREATE OR REPLACE FUNCTION public.is_editor(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('owner','editor'));
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_editor(auth.uid()));

-- PROFILES (authors)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  job_title text,
  bio text,
  avatar_url text,
  email text,
  twitter text,
  linkedin text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_editor(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_editor(auth.uid()));
CREATE POLICY "profiles editor insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_editor(auth.uid()));
CREATE POLICY "profiles editor delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_editor(auth.uid()));
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- new users get a profile + subscriber role
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base_slug text; final_slug text; n int := 0;
BEGIN
  base_slug := regexp_replace(lower(coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1))), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN base_slug := 'author'; END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    n := n + 1; final_slug := base_slug || '-' || n;
  END LOOP;
  INSERT INTO public.profiles (user_id, slug, display_name, email)
  VALUES (NEW.id, final_slug, coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN (SELECT count(*) FROM public.user_roles WHERE role = 'owner') = 0 THEN 'owner'::public.app_role ELSE 'subscriber'::public.app_role END);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories staff write" ON public.categories FOR ALL TO authenticated
  USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()));

-- TAGS
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags public read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags staff write" ON public.tags FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- POSTS
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  excerpt text,
  dateline text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_url text,
  cover_caption text,
  cover_credit text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.post_status NOT NULL DEFAULT 'draft',
  is_breaking boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_editors_pick boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  scheduled_for timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  social_image_url text,
  view_count int NOT NULL DEFAULT 0,
  reading_minutes int NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_status_pub_idx ON public.posts (status, published_at DESC);
CREATE INDEX posts_category_idx ON public.posts (category_id);
CREATE INDEX posts_author_idx ON public.posts (author_id);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read published" ON public.posts FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "posts staff read" ON public.posts FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "posts staff insert" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "posts update" ON public.posts FOR UPDATE TO authenticated
  USING (public.is_editor(auth.uid()) OR created_by = auth.uid())
  WITH CHECK (public.is_editor(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "posts delete" ON public.posts FOR DELETE TO authenticated
  USING (public.is_editor(auth.uid()) OR created_by = auth.uid());
CREATE TRIGGER posts_updated BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- POST TAGS
CREATE TABLE public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
GRANT SELECT ON public.post_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_tags TO authenticated;
GRANT ALL ON public.post_tags TO service_role;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_tags public read" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "post_tags staff write" ON public.post_tags FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- MEDIA
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  file_name text NOT NULL,
  alt_text text,
  caption text,
  credit text,
  width int,
  height int,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media public read" ON public.media FOR SELECT USING (true);
CREATE POLICY "media staff write" ON public.media FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- COMMENTS
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  body text NOT NULL,
  status public.comment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments public read approved" ON public.comments FOR SELECT
  USING (status = 'approved');
CREATE POLICY "comments staff read" ON public.comments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "comments anyone submit" ON public.comments FOR INSERT
  WITH CHECK (status = 'pending');
CREATE POLICY "comments staff moderate" ON public.comments FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "comments staff delete" ON public.comments FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- SITE SETTINGS (single row)
CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true,
  site_name text NOT NULL DEFAULT 'The Dispatch',
  tagline text NOT NULL DEFAULT 'Independent reporting, carefully told.',
  breaking_enabled boolean NOT NULL DEFAULT true,
  breaking_text text,
  breaking_href text,
  about_text text,
  contact_email text,
  twitter text,
  linkedin text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id)
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings editor write" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()));

-- NEWSLETTER
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon;
GRANT SELECT, INSERT, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers anyone insert" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "subscribers staff read" ON public.subscribers FOR SELECT TO authenticated
  USING (public.is_editor(auth.uid()));

-- view counter
CREATE OR REPLACE FUNCTION public.increment_post_view(_slug text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.posts SET view_count = view_count + 1
  WHERE slug = _slug AND status = 'published';
$$;
GRANT EXECUTE ON FUNCTION public.increment_post_view(text) TO anon, authenticated;

-- SEED -----------------------------------------------------------------
INSERT INTO public.site_settings (id, site_name, tagline, breaking_enabled, breaking_text, breaking_href, contact_email)
VALUES (true, 'The Dispatch', 'Independent reporting, carefully told.', true,
  'Parliament passes sweeping data-protection bill after nine-hour debate', '/article/parliament-passes-data-protection-bill', 'newsroom@thedispatch.press');

INSERT INTO public.categories (id, slug, name, description, sort_order) VALUES
 ('11111111-1111-4111-8111-000000000001','national','National','Reporting on government, institutions and public life.',1),
 ('11111111-1111-4111-8111-000000000002','politics','Politics','Power, policy and the people who shape them.',2),
 ('11111111-1111-4111-8111-000000000003','international','International','Dispatches from across the region and the world.',3),
 ('11111111-1111-4111-8111-000000000004','business','Business','Markets, labour and the economy.',4),
 ('11111111-1111-4111-8111-000000000005','technology','Technology','How technology reshapes work, rights and cities.',5),
 ('11111111-1111-4111-8111-000000000006','culture','Culture','Arts, ideas and the life of the city.',6),
 ('11111111-1111-4111-8111-000000000007','opinion','Opinion','Argument and analysis from our contributors.',7);

INSERT INTO public.profiles (id, slug, display_name, job_title, bio, email, twitter) VALUES
 ('22222222-2222-4222-8222-000000000001','arif-rahman','Arif Rahman','Chief Correspondent','Arif Rahman has covered national politics and public institutions for fourteen years, reporting from Dhaka, Delhi and Geneva. He writes on governance, accountability and the machinery of the state.','arif@thedispatch.press','arifreports'),
 ('22222222-2222-4222-8222-000000000002','nadia-haque','Nadia Haque','Business Editor','Nadia Haque writes about labour markets, industrial policy and the economics of the garment trade.','nadia@thedispatch.press',NULL),
 ('22222222-2222-4222-8222-000000000003','samuel-otieno','Samuel Otieno','Technology Correspondent','Samuel Otieno reports on surveillance, digital rights and the platforms that mediate public life.','samuel@thedispatch.press',NULL);

INSERT INTO public.tags (id, slug, name) VALUES
 ('33333333-3333-4333-8333-000000000001','parliament','Parliament'),
 ('33333333-3333-4333-8333-000000000002','privacy','Privacy'),
 ('33333333-3333-4333-8333-000000000003','labour','Labour'),
 ('33333333-3333-4333-8333-000000000004','elections','Elections');

INSERT INTO public.posts (id, slug, title, subtitle, excerpt, dateline, body, cover_url, cover_caption, cover_credit, category_id, author_id, status, is_breaking, is_featured, is_editors_pick, published_at, view_count, reading_minutes, seo_title, seo_description) VALUES
('44444444-4444-4444-8444-000000000001','parliament-passes-data-protection-bill',
 'Parliament passes sweeping data-protection bill after nine-hour debate',
 'The law creates an independent commission with the power to fine companies up to four percent of annual turnover — but critics say state agencies remain exempt.',
 'The bill cleared its final reading shortly after midnight, ending a two-year legislative fight that split the governing coalition.',
 'Dhaka',
 '[{"type":"paragraph","text":"Parliament approved the Data Protection Act shortly after midnight on Tuesday, ending a two-year legislative fight that at times split the governing coalition and drew unusually public criticism from the country''s largest technology employers."},{"type":"paragraph","text":"The law establishes an independent commission with authority to investigate complaints, order the deletion of unlawfully held records and levy fines of up to four percent of a company''s annual turnover."},{"type":"heading","text":"What the law does"},{"type":"list","items":["Creates a five-member commission appointed for staggered six-year terms","Requires breach notification within 72 hours","Gives citizens the right to obtain and correct records held about them","Restricts transfers of personal data outside the country without adequacy findings"]},{"type":"quote","text":"This is the most consequential privacy legislation the country has passed. It is also, in one important respect, unfinished.","attribution":"Farhana Islam, director of the Centre for Digital Rights"},{"type":"paragraph","text":"That unfinished respect is the exemption carved out for state agencies acting on grounds of national security. The clause survived every attempt at amendment, including a late-night effort by three coalition backbenchers."},{"type":"callout","text":"The commission is expected to be seated within ninety days. Enforcement powers begin one year after that."},{"type":"paragraph","text":"Industry groups had warned that compliance costs would fall hardest on smaller firms. The final text softened those obligations for companies below a turnover threshold, a concession negotiated in committee last month."}]'::jsonb,
 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1600&q=80',
 'The chamber shortly before the final vote.','Photo: Rashid Karim / The Dispatch',
 '11111111-1111-4111-8111-000000000001','22222222-2222-4222-8222-000000000001','published',true,true,true, now() - interval '3 hours', 4820, 6,
 'Parliament passes data-protection bill','Parliament approved a sweeping data-protection law creating an independent commission with power to fine companies up to four percent of turnover.'),
('44444444-4444-4444-8444-000000000002','garment-wages-negotiation-stalls',
 'Garment wage talks stall as factory owners reject the board''s figure',
 'A third round of negotiations ended without agreement, leaving four million workers waiting on a minimum-wage decision already six weeks overdue.',
 'Negotiations broke down over a gap of roughly eighteen percent between the two proposals.',
 'Chattogram',
 '[{"type":"paragraph","text":"A third round of minimum-wage negotiations for the garment sector ended Thursday without agreement, leaving a decision that affects roughly four million workers six weeks past its statutory deadline."},{"type":"paragraph","text":"The workers'' panel has held to a figure of 23,000 taka a month. Owners countered at 19,500, arguing that order volumes from European buyers have not recovered."},{"type":"heading","text":"Where the gap sits"},{"type":"paragraph","text":"The eighteen percent difference between the two positions is narrower than at the same stage in the previous review, but the mood in the room was worse, according to two people present who were not authorised to speak publicly."},{"type":"quote","text":"Every month of delay is a month of wages set at a rate nobody thinks is defensible.","attribution":"Shirin Akter, federation organiser"}]'::jsonb,
 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1600&q=80',
 'Workers leaving a factory at the end of a shift.','Photo: Nadia Haque / The Dispatch',
 '11111111-1111-4111-8111-000000000004','22222222-2222-4222-8222-000000000002','published',false,false,true, now() - interval '9 hours', 2140, 5, NULL, NULL),
('44444444-4444-4444-8444-000000000003','city-surveillance-cameras-audit',
 'City installed 4,000 cameras. Nobody can say who watches the footage.',
 'A four-month review of procurement records found no retention policy, no access log and no published oversight arrangement.',
 'Records obtained under disclosure rules show the network expanded faster than the rules governing it.',
 'Dhaka',
 '[{"type":"paragraph","text":"The city''s camera network has more than tripled in four years. The rules governing who may view its footage, and for how long it is kept, have not been updated since 2016."},{"type":"paragraph","text":"A review of procurement records, contracts and correspondence found no written retention policy, no access log available to auditors, and no published oversight arrangement."},{"type":"list","items":["4,112 cameras active as of March","No documented retention limit","Three private contractors hold administrative access"]},{"type":"paragraph","text":"City officials said a governance framework is in preparation. Asked when it would be published, a spokesperson said no date had been set."}]'::jsonb,
 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=80',
 'A camera mounted above an intersection in the old city.','Photo: Samuel Otieno / The Dispatch',
 '11111111-1111-4111-8111-000000000005','22222222-2222-4222-8222-000000000003','published',false,false,true, now() - interval '1 day', 6310, 8, NULL, NULL),
('44444444-4444-4444-8444-000000000004','coalition-backbench-revolt',
 'Backbench revolt leaves the coalition one vote from trouble',
 'Three governing-party members abstained on the security exemption, a signal party managers had spent a week trying to prevent.',
 'The abstentions were quiet, but their arithmetic was not.',
 'Dhaka',
 '[{"type":"paragraph","text":"Three governing-party members abstained on the security exemption clause, a result party managers had spent the previous week trying to prevent through a combination of persuasion and committee assignments."},{"type":"paragraph","text":"The abstentions did not change the outcome. They did change the arithmetic of the sessions to come."}]'::jsonb,
 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
 'The governing benches during Tuesday''s debate.','Photo: Rashid Karim / The Dispatch',
 '11111111-1111-4111-8111-000000000002','22222222-2222-4222-8222-000000000001','published',false,false,false, now() - interval '2 days', 1890, 4, NULL, NULL),
('44444444-4444-4444-8444-000000000005','regional-summit-trade-corridor',
 'Regional summit ends with a trade corridor and few specifics',
 'Four governments signed a memorandum on freight and customs. The financing annex was left for later.',
 'Officials called the memorandum a framework. Critics called it a photograph.',
 'Kathmandu',
 '[{"type":"paragraph","text":"Four governments signed a memorandum of understanding on a regional freight corridor, committing to harmonised customs procedures and a joint technical committee."},{"type":"paragraph","text":"The financing annex, the part that determines whether any of it is built, was left for a later meeting."}]'::jsonb,
 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=80',
 'Delegates at the closing session.','Photo: Reuters pool',
 '11111111-1111-4111-8111-000000000003','22222222-2222-4222-8222-000000000002','published',false,false,false, now() - interval '3 days', 980, 4, NULL, NULL),
('44444444-4444-4444-8444-000000000006','the-case-for-publishing-the-audit',
 'The case for publishing the audit in full',
 'Redaction has become the default. It should be the exception, and it should be explained.',
 'Withholding a document is a decision. Decisions should be defensible in public.',
 'Dhaka',
 '[{"type":"paragraph","text":"Redaction has become the default posture of institutions that were built to be looked at. That is a change in practice, not in law, and it happened without anyone defending it."},{"type":"quote","text":"A withheld page is a decision. Decisions should be explained.","attribution":null},{"type":"paragraph","text":"Publishing the audit in full would cost the ministry a difficult week. Not publishing it costs everyone else something harder to measure."}]'::jsonb,
 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80',
 NULL,'Photo: The Dispatch',
 '11111111-1111-4111-8111-000000000007','22222222-2222-4222-8222-000000000001','published',false,false,false, now() - interval '4 days', 1420, 3, NULL, NULL),
('44444444-4444-4444-8444-000000000007','archive-restoration-project',
 'Inside the quiet effort to save a century of newsprint',
 'A small team in a basement is digitising 1.2 million pages before the paper gives out.',
 'The work is slow, unglamorous and running against a deadline nobody set.',
 'Dhaka',
 '[{"type":"paragraph","text":"In a basement two floors below the reading room, six people are working through 1.2 million pages of newsprint that are, slowly and irreversibly, turning to dust."},{"type":"paragraph","text":"The project has no completion date. It has a rate: about nine hundred pages a day."}]'::jsonb,
 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80',
 'Bound volumes awaiting scanning.','Photo: Samuel Otieno / The Dispatch',
 '11111111-1111-4111-8111-000000000006','22222222-2222-4222-8222-000000000003','published',false,false,false, now() - interval '5 days', 760, 5, NULL, NULL);

INSERT INTO public.post_tags (post_id, tag_id) VALUES
 ('44444444-4444-4444-8444-000000000001','33333333-3333-4333-8333-000000000001'),
 ('44444444-4444-4444-8444-000000000001','33333333-3333-4333-8333-000000000002'),
 ('44444444-4444-4444-8444-000000000002','33333333-3333-4333-8333-000000000003'),
 ('44444444-4444-4444-8444-000000000003','33333333-3333-4333-8333-000000000002'),
 ('44444444-4444-4444-8444-000000000004','33333333-3333-4333-8333-000000000001');

INSERT INTO public.comments (post_id, author_name, body, status) VALUES
 ('44444444-4444-4444-8444-000000000001','Imran S.','The exemption clause is the whole story. Good to see it reported that way.','approved'),
 ('44444444-4444-4444-8444-000000000003','Lena M.','Would like to see the procurement records published alongside this.','pending');

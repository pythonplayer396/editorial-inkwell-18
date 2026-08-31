-- ============ posts workflow columns ============
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_by uuid,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS correction_note text,
  ADD COLUMN IF NOT EXISTS correction_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS coverage_areas text[] NOT NULL DEFAULT '{}';

-- ============ article events (editorial timeline) ============
CREATE TABLE IF NOT EXISTS public.article_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.article_events TO authenticated;
GRANT ALL ON public.article_events TO service_role;
ALTER TABLE public.article_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events staff read" ON public.article_events FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "events staff insert" ON public.article_events FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND (actor_id = auth.uid() OR actor_id IS NULL));

-- ============ editorial feedback ============
CREATE TABLE IF NOT EXISTS public.article_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text,
  kind text NOT NULL DEFAULT 'changes_requested',
  reason text,
  body text NOT NULL,
  internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_feedback TO authenticated;
GRANT ALL ON public.article_feedback TO service_role;
ALTER TABLE public.article_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback editor read all" ON public.article_feedback FOR SELECT TO authenticated
  USING (public.is_editor(auth.uid()));
CREATE POLICY "feedback journalist read own" ON public.article_feedback FOR SELECT TO authenticated
  USING (
    internal = false
    AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.created_by = auth.uid())
  );
CREATE POLICY "feedback editor write" ON public.article_feedback FOR INSERT TO authenticated
  WITH CHECK (public.is_editor(auth.uid()) AND author_id = auth.uid());
CREATE POLICY "feedback editor delete" ON public.article_feedback FOR DELETE TO authenticated
  USING (public.is_editor(auth.uid()));

-- ============ notifications ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications read own" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications update own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications delete own" ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications staff create" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- ============ journalist applications ============
CREATE TABLE IF NOT EXISTS public.journalist_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  bio text,
  experience text,
  coverage_areas text[] NOT NULL DEFAULT '{}',
  previous_publications text,
  portfolio_links text,
  motivation text,
  status text NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journalist_applications TO authenticated;
GRANT INSERT ON public.journalist_applications TO anon;
GRANT ALL ON public.journalist_applications TO service_role;
ALTER TABLE public.journalist_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications anyone submit" ON public.journalist_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');
CREATE POLICY "applications read own" ON public.journalist_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_editor(auth.uid()));
CREATE POLICY "applications editor update" ON public.journalist_applications FOR UPDATE TO authenticated
  USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()));
CREATE POLICY "applications editor delete" ON public.journalist_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));
CREATE TRIGGER applications_updated BEFORE UPDATE ON public.journalist_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ audit log ============
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_label text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit owner read" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "audit staff insert" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND (actor_id = auth.uid() OR actor_id IS NULL));

-- ============ role permissions ============
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions staff read" ON public.role_permissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "permissions owner write" ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  );
$$;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.perm FROM
  (VALUES ('owner'::public.app_role)) AS r(role),
  (VALUES ('view_articles'),('edit_articles'),('review_articles'),('approve_articles'),
          ('publish_articles'),('schedule_articles'),('delete_articles'),('view_media'),
          ('upload_media'),('delete_media'),('moderate_comments'),('manage_sections'),
          ('manage_categories'),('manage_tags'),('manage_journalists'),('manage_readers'),
          ('view_analytics'),('manage_settings'),('manage_staff')) AS p(perm)
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.perm FROM
  (VALUES ('editor'::public.app_role)) AS r(role),
  (VALUES ('view_articles'),('edit_articles'),('review_articles'),('approve_articles'),
          ('publish_articles'),('schedule_articles'),('view_media'),('upload_media'),
          ('moderate_comments'),('manage_sections'),('manage_categories'),('manage_tags'),
          ('manage_journalists'),('view_analytics')) AS p(perm)
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role, p.perm FROM
  (VALUES ('author'::public.app_role),('contributor'::public.app_role)) AS r(role),
  (VALUES ('view_articles'),('edit_articles'),('view_media'),('upload_media')) AS p(perm)
ON CONFLICT DO NOTHING;

-- ============ workflow guard: journalists cannot self-publish ============
CREATE OR REPLACE FUNCTION public.enforce_editorial_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE editor boolean;
BEGIN
  editor := public.is_editor(auth.uid());
  IF editor THEN RETURN NEW; END IF;

  IF NEW.status IN ('approved','scheduled','published') THEN
    RAISE EXCEPTION 'Only editors can approve, schedule or publish a story.';
  END IF;
  IF NEW.is_breaking OR NEW.is_editors_pick THEN
    RAISE EXCEPTION 'Only editors can flag a story as Breaking or Editor''s Pick.';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.approved_by := OLD.approved_by;
    NEW.approved_at := OLD.approved_at;
    NEW.published_by := OLD.published_by;
    NEW.published_at := OLD.published_at;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.created_by := OLD.created_by;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS posts_workflow_guard ON public.posts;
CREATE TRIGGER posts_workflow_guard BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_editorial_workflow();
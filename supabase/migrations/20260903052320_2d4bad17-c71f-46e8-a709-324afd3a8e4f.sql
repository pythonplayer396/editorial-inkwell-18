CREATE OR REPLACE FUNCTION public.grant_author_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  n int := 0;
BEGIN
  IF NEW.status = 'approved' AND NEW.user_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'author'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id) THEN
      base_slug := regexp_replace(lower(coalesce(NEW.full_name, 'author')), '[^a-z0-9]+', '-', 'g');
      base_slug := trim(both '-' from base_slug);
      IF base_slug = '' THEN base_slug := 'author'; END IF;
      final_slug := base_slug;
      WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
        n := n + 1;
        final_slug := base_slug || '-' || n::text;
      END LOOP;

      INSERT INTO public.profiles (user_id, slug, display_name, bio, avatar_url, email, experience, coverage_areas)
      VALUES (NEW.user_id, final_slug, coalesce(NEW.full_name, 'Author'), NEW.bio, NEW.avatar_url, NEW.email, NEW.experience, coalesce(NEW.coverage_areas, '{}'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_author_on_approval ON public.journalist_applications;
CREATE TRIGGER trg_grant_author_on_approval
AFTER INSERT OR UPDATE OF status ON public.journalist_applications
FOR EACH ROW EXECUTE FUNCTION public.grant_author_on_approval();

INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT ja.user_id, 'author'::app_role
FROM public.journalist_applications ja
WHERE ja.status = 'approved' AND ja.user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;
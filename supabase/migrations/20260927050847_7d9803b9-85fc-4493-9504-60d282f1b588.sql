CREATE OR REPLACE FUNCTION public.guard_single_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE em text;
BEGIN
  IF NEW.role IN ('owner','editor') THEN
    SELECT email INTO em FROM auth.users WHERE id = NEW.user_id;
    IF em IS DISTINCT FROM 'rianhqhq1122@gmail.com' THEN
      RAISE EXCEPTION 'Admin roles are restricted to the site owner account.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_single_owner ON public.user_roles;
CREATE TRIGGER trg_guard_single_owner
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_single_owner();
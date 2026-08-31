GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE POLICY "owners insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "owners update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "owners delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'owner') AND NOT (user_id = auth.uid() AND role = 'owner'));

CREATE POLICY "owners read all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'owner'));
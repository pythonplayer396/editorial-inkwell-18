GRANT INSERT, SELECT ON public.journalist_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journalist_applications TO authenticated;
GRANT ALL ON public.journalist_applications TO service_role;
CREATE TABLE public.post_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  subtitle text,
  excerpt text,
  dateline text,
  cover_url text,
  cover_caption text,
  cover_credit text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_minutes integer NOT NULL DEFAULT 1,
  kind text NOT NULL DEFAULT 'autosave',
  author_id uuid,
  author_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX post_revisions_post_created_idx ON public.post_revisions (post_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.post_revisions TO authenticated;
GRANT ALL ON public.post_revisions TO service_role;

ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revisions staff read"
  ON public.post_revisions FOR SELECT TO authenticated
  USING (
    public.is_editor(auth.uid())
    OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.created_by = auth.uid())
  );

CREATE POLICY "revisions author insert"
  ON public.post_revisions FOR INSERT TO authenticated
  WITH CHECK (
    public.is_staff(auth.uid())
    AND (author_id = auth.uid() OR author_id IS NULL)
    AND (
      public.is_editor(auth.uid())
      OR EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.created_by = auth.uid())
    )
  );

CREATE POLICY "revisions editor delete"
  ON public.post_revisions FOR DELETE TO authenticated
  USING (public.is_editor(auth.uid()));
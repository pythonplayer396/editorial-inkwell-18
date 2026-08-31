CREATE TABLE public.reader_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reader_bookmarks TO authenticated;
GRANT ALL ON public.reader_bookmarks TO service_role;
ALTER TABLE public.reader_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks own read" ON public.reader_bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "bookmarks own insert" ON public.reader_bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookmarks own delete" ON public.reader_bookmarks FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.reader_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('author','category')),
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reader_follows TO authenticated;
GRANT ALL ON public.reader_follows TO service_role;
ALTER TABLE public.reader_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows own read" ON public.reader_follows FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "follows own insert" ON public.reader_follows FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "follows own delete" ON public.reader_follows FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.reader_preferences (
  user_id uuid PRIMARY KEY,
  email_digest boolean NOT NULL DEFAULT true,
  notify_new_stories boolean NOT NULL DEFAULT true,
  notify_replies boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reader_preferences TO authenticated;
GRANT ALL ON public.reader_preferences TO service_role;
ALTER TABLE public.reader_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prefs own read" ON public.reader_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "prefs own insert" ON public.reader_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "prefs own update" ON public.reader_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER reader_preferences_updated BEFORE UPDATE ON public.reader_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_reader_bookmarks_user ON public.reader_bookmarks(user_id, created_at DESC);
CREATE INDEX idx_reader_follows_user ON public.reader_follows(user_id);
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { db } from "./queries";
import type { Post } from "./types";

const anyDb = db as any;

export interface ReaderPreferences {
  user_id: string;
  email_digest: boolean;
  notify_new_stories: boolean;
  notify_replies: boolean;
  locale: string;
}

export interface FollowRow {
  id: string;
  target_type: "author" | "category";
  target_id: string;
}

/** Saved stories for the signed-in reader. */
export function useBookmarks() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["reader", "bookmarks", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await anyDb
        .from("reader_bookmarks")
        .select("id, post_id, created_at, post:posts(*, author:profiles(*), category:categories(*))")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as { id: string; post_id: string; created_at: string; post: Post | null }[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (postId: string) => {
      if (!userId) throw new Error("Sign in to save stories");
      const existing = (list.data ?? []).find((b) => b.post_id === postId);
      if (existing) {
        const { error } = await anyDb.from("reader_bookmarks").delete().eq("id", existing.id);
        if (error) throw new Error(error.message);
        return false;
      }
      const { error } = await anyDb
        .from("reader_bookmarks")
        .insert({ user_id: userId, post_id: postId });
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: (saved) => {
      void qc.invalidateQueries({ queryKey: ["reader", "bookmarks"] });
      toast.success(saved ? "Saved to your reading list" : "Removed from your list");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    bookmarks: list.data ?? [],
    loading: list.isLoading,
    isSaved: (postId: string) => (list.data ?? []).some((b) => b.post_id === postId),
    toggle: (postId: string) => toggle.mutate(postId),
    busy: toggle.isPending,
    signedIn: Boolean(userId),
  };
}

/** Followed journalists and sections. */
export function useFollows() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["reader", "follows", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await anyDb.from("reader_follows").select("*");
      if (error) throw new Error(error.message);
      return (data ?? []) as FollowRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (target: { type: "author" | "category"; id: string }) => {
      if (!userId) throw new Error("Sign in to follow");
      const existing = (list.data ?? []).find(
        (f) => f.target_type === target.type && f.target_id === target.id,
      );
      if (existing) {
        const { error } = await anyDb.from("reader_follows").delete().eq("id", existing.id);
        if (error) throw new Error(error.message);
        return false;
      }
      const { error } = await anyDb
        .from("reader_follows")
        .insert({ user_id: userId, target_type: target.type, target_id: target.id });
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: (following) => {
      void qc.invalidateQueries({ queryKey: ["reader", "follows"] });
      toast.success(following ? "Following" : "Unfollowed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    follows: list.data ?? [],
    loading: list.isLoading,
    isFollowing: (type: "author" | "category", id: string) =>
      (list.data ?? []).some((f) => f.target_type === type && f.target_id === id),
    toggle: (type: "author" | "category", id: string) => toggle.mutate({ type, id }),
    busy: toggle.isPending,
    signedIn: Boolean(userId),
  };
}

/** Reader notification and language preferences. */
export function usePreferences() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();

  const prefs = useQuery({
    queryKey: ["reader", "preferences", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await anyDb
        .from("reader_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as ReaderPreferences | null;
    },
  });

  const save = useMutation({
    mutationFn: async (patch: Partial<ReaderPreferences>) => {
      if (!userId) throw new Error("Sign in first");
      const { error } = await anyDb
        .from("reader_preferences")
        .upsert({ user_id: userId, ...prefs.data, ...patch }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reader", "preferences"] });
      toast.success("Preferences saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    prefs: prefs.data ?? null,
    loading: prefs.isLoading,
    save: (patch: Partial<ReaderPreferences>) => save.mutate(patch),
    saving: save.isPending,
  };
}

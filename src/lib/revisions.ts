import { queryOptions } from "@tanstack/react-query";

import { db } from "./queries";
import type { Block } from "./blocks";

export interface RevisionSnapshot {
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  dateline: string | null;
  cover_url: string | null;
  cover_caption: string | null;
  cover_credit: string | null;
  body: Block[];
  reading_minutes: number;
}

export interface PostRevision extends RevisionSnapshot {
  id: string;
  post_id: string;
  kind: "autosave" | "manual";
  author_id: string | null;
  author_name: string | null;
  created_at: string;
}

export function revisionsQuery(postId: string | undefined) {
  return queryOptions({
    queryKey: ["admin", "revisions", postId],
    enabled: Boolean(postId),
    queryFn: async () => {
      const { data, error } = await db
        .from("post_revisions")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) throw new Error((error as { message: string }).message);
      return (data ?? []) as PostRevision[];
    },
  });
}

export async function saveRevision(
  postId: string,
  snapshot: RevisionSnapshot,
  kind: "autosave" | "manual",
  actor: { userId?: string; name?: string },
) {
  const { error } = await db.from("post_revisions").insert({
    post_id: postId,
    ...snapshot,
    kind,
    author_id: actor.userId ?? null,
    author_name: actor.name ?? null,
  });
  if (error) throw new Error((error as { message: string }).message);
}

/** Trim old autosaves so history stays readable. */
export async function pruneAutosaves(postId: string, keep = 10) {
  const { data } = await db
    .from("post_revisions")
    .select("id")
    .eq("post_id", postId)
    .eq("kind", "autosave")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string }[];
  const stale = rows.slice(keep).map((r) => r.id);
  if (stale.length) await db.from("post_revisions").delete().in("id", stale);
}

export function snapshotSignature(s: RevisionSnapshot) {
  return JSON.stringify([
    s.title,
    s.subtitle,
    s.excerpt,
    s.dateline,
    s.cover_url,
    s.cover_caption,
    s.cover_credit,
    (s.body ?? []).map((b) => [b.type, b.text ?? "", (b.items ?? []).join("|"), b.url ?? ""]),
  ]);
}

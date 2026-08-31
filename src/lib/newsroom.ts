import { queryOptions } from "@tanstack/react-query";

import { db } from "./queries";
import type {
  ArticleEvent,
  ArticleFeedback,
  AuditEntry,
  JournalistApplication,
  NotificationRow,
  Post,
} from "./types";

const POST_SELECT =
  "*, category:categories(id,slug,name,description,sort_order), author:profiles(id,user_id,slug,display_name,job_title,bio,avatar_url,email,twitter,linkedin,website)";

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ----------------------------- journalist ----------------------------- */

export function myStoriesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["journalist", "stories", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap<Post[]>(
        await db
          .from("posts")
          .select(POST_SELECT)
          .eq("created_by", userId)
          .order("updated_at", { ascending: false }),
      ),
  });
}

export function myFeedbackQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["journalist", "feedback", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap<ArticleFeedback[]>(
        await db
          .from("article_feedback")
          .select("*, post:posts(id,title,slug)")
          .eq("internal", false)
          .order("created_at", { ascending: false })
          .limit(20),
      ),
  });
}

export function storyFeedbackQuery(postId: string | undefined, includeInternal = false) {
  return queryOptions({
    queryKey: ["story", "feedback", postId, includeInternal],
    enabled: Boolean(postId),
    queryFn: async () => {
      let q = db.from("article_feedback").select("*").eq("post_id", postId);
      if (!includeInternal) q = q.eq("internal", false);
      return unwrap<ArticleFeedback[]>(await q.order("created_at", { ascending: false }));
    },
  });
}

export function storyTimelineQuery(postId: string | undefined) {
  return queryOptions({
    queryKey: ["story", "timeline", postId],
    enabled: Boolean(postId),
    queryFn: async () =>
      unwrap<ArticleEvent[]>(
        await db
          .from("article_events")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: true }),
      ),
  });
}

/* -------------------------------- staff ------------------------------- */

export const submissionsQuery = queryOptions({
  queryKey: ["staff", "submissions"],
  queryFn: async () =>
    unwrap<Post[]>(
      await db
        .from("posts")
        .select(POST_SELECT)
        .in("status", ["submitted", "under_review", "changes_requested"])
        .order("submitted_at", { ascending: true, nullsFirst: false }),
    ),
});

export const approvedQueueQuery = queryOptions({
  queryKey: ["staff", "approved"],
  queryFn: async () =>
    unwrap<Post[]>(
      await db
        .from("posts")
        .select(POST_SELECT)
        .in("status", ["approved", "scheduled"])
        .order("approved_at", { ascending: false }),
    ),
});

/* ------------------------------- admin -------------------------------- */

export const recentActivityQuery = queryOptions({
  queryKey: ["admin", "activity"],
  queryFn: async () =>
    unwrap<AuditEntry[]>(
      await db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
    ),
});

export const applicationsQuery = queryOptions({
  queryKey: ["admin", "applications"],
  queryFn: async () =>
    unwrap<JournalistApplication[]>(
      await db.from("journalist_applications").select("*").order("created_at", { ascending: false }),
    ),
});

export const rolePermissionsQuery = queryOptions({
  queryKey: ["admin", "role-permissions"],
  queryFn: async () =>
    unwrap<{ id: string; role: string; permission: string }[]>(
      await db.from("role_permissions").select("*"),
    ),
});

export const staffDirectoryQuery = queryOptions({
  queryKey: ["admin", "staff-directory"],
  queryFn: async () => {
    const roles = unwrap<{ id: string; user_id: string; role: string }[]>(
      await db.from("user_roles").select("*"),
    );
    const profiles = unwrap<
      { id: string; user_id: string | null; display_name: string; email: string | null; slug: string; job_title: string | null; avatar_url: string | null }[]
    >(await db.from("profiles").select("id,user_id,display_name,email,slug,job_title,avatar_url"));
    return profiles.map((p) => ({
      ...p,
      roles: roles.filter((r) => r.user_id === p.user_id).map((r) => r.role),
    }));
  },
});

/* --------------------------- notifications ---------------------------- */

export function notificationsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["notifications", userId],
    enabled: Boolean(userId),
    refetchInterval: 60_000,
    queryFn: async () =>
      unwrap<NotificationRow[]>(
        await db
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30),
      ),
  });
}

export async function markNotificationRead(id: string) {
  await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}

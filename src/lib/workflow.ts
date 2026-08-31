import { db } from "./queries";
import type { Post, PostStatus } from "./types";

/** The newsroom workflow, in order. */
export const WORKFLOW_STATUSES: PostStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "changes_requested",
  "rejected",
  "approved",
  "scheduled",
  "published",
  "archived",
];

export const REJECTION_REASONS = [
  "Needs Major Revision",
  "Insufficient Sourcing",
  "Factual Concerns",
  "Duplicate Story",
  "Not Suitable for Publication",
  "Incorrect Category",
  "Other",
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];

/** Restrained, semantic tones — no new colour system. */
export function statusTone(status: PostStatus): string {
  switch (status) {
    case "published":
      return "border-success/40 text-success";
    case "approved":
      return "border-success/30 text-success/90";
    case "scheduled":
      return "border-warning/40 text-warning";
    case "changes_requested":
      return "border-warning/50 text-warning";
    case "rejected":
      return "border-destructive/40 text-destructive";
    case "submitted":
    case "under_review":
    case "in_review":
      return "border-secondary-accent/40 text-secondary-accent";
    default:
      return "border-border text-muted-foreground";
  }
}

/** What the journalist should do next, in plain language. */
export function nextStepFor(status: PostStatus): string | null {
  switch (status) {
    case "draft":
      return "Keep writing, then submit it for review when you're ready.";
    case "submitted":
      return "Submitted. An editor will pick it up shortly.";
    case "under_review":
      return "An editor is reading your story right now.";
    case "changes_requested":
      return "Your editor asked for changes. Read the feedback, revise, then resubmit.";
    case "rejected":
      return "This story wasn't accepted. The reason is on the story.";
    case "approved":
      return "Approved. An editor will publish or schedule it.";
    case "scheduled":
      return "Scheduled — it will go live automatically.";
    case "published":
      return "Live on the site.";
    default:
      return null;
  }
}

export const JOURNALIST_EDITABLE: PostStatus[] = ["draft", "changes_requested", "rejected"];

export interface Actor {
  userId: string | undefined;
  name: string;
}

async function logEvent(postId: string, actor: Actor, action: string, detail?: string) {
  await db.from("article_events").insert({
    post_id: postId,
    actor_id: actor.userId ?? null,
    actor_name: actor.name,
    action,
    detail: detail ?? null,
  });
}

async function audit(
  actor: Actor,
  action: string,
  entity: { type: string; id?: string | undefined; label?: string | undefined },
  detail?: string,
) {
  await db.from("audit_log").insert({
    actor_id: actor.userId ?? null,
    actor_name: actor.name,
    action,
    entity_type: entity.type,
    entity_id: entity.id ?? null,
    entity_label: entity.label ?? null,
    detail: detail ?? null,
  });
}

async function notify(
  userId: string | null | undefined,
  payload: { kind?: string; title: string; body?: string; href?: string },
) {
  if (!userId) return;
  await db.from("notifications").insert({
    user_id: userId,
    kind: payload.kind ?? "info",
    title: payload.title,
    body: payload.body ?? null,
    href: payload.href ?? null,
  });
}

async function setStatus(postId: string, patch: Record<string, unknown>) {
  const { error } = await db.from("posts").update(patch).eq("id", postId);
  if (error) throw new Error((error as { message: string }).message);
}

/* ------------------------- journalist actions ------------------------- */

export async function submitStory(post: Post, actor: Actor) {
  const resubmit = post.status === "changes_requested" || post.status === "rejected";
  await setStatus(post.id, { status: "submitted", submitted_at: new Date().toISOString() });
  await logEvent(post.id, actor, resubmit ? "resubmitted" : "submitted", null ?? undefined);
  await notify(post.created_by ?? actor.userId, {
    title: resubmit ? "Story resubmitted" : "Story submitted for review",
    body: post.title,
    href: "/newsroom",
  });
  await audit(actor, resubmit ? "Resubmitted" : "Submitted", {
    type: "article",
    id: post.id,
    label: post.title,
  });
}

/* --------------------------- staff actions ---------------------------- */

export async function startReview(post: Post, actor: Actor) {
  if (post.status !== "submitted") return;
  await setStatus(post.id, {
    status: "under_review",
    reviewed_by: actor.userId ?? null,
    reviewed_at: new Date().toISOString(),
  });
  await logEvent(post.id, actor, "review_started");
  await notify(post.created_by, {
    title: "Your story is under review",
    body: post.title,
    href: "/newsroom",
  });
}

export async function requestChanges(post: Post, actor: Actor, note: string) {
  await db.from("article_feedback").insert({
    post_id: post.id,
    author_id: actor.userId ?? null,
    author_name: actor.name,
    kind: "changes_requested",
    body: note,
    internal: false,
  });
  await setStatus(post.id, { status: "changes_requested" });
  await logEvent(post.id, actor, "changes_requested", note);
  await notify(post.created_by, {
    kind: "warning",
    title: "Changes requested",
    body: post.title,
    href: "/newsroom",
  });
  await audit(actor, "Requested changes", { type: "article", id: post.id, label: post.title }, note);
}

export async function rejectStory(post: Post, actor: Actor, reason: string, note: string) {
  await db.from("article_feedback").insert({
    post_id: post.id,
    author_id: actor.userId ?? null,
    author_name: actor.name,
    kind: "rejected",
    reason,
    body: note || reason,
    internal: false,
  });
  await setStatus(post.id, { status: "rejected", rejection_reason: reason });
  await logEvent(post.id, actor, "rejected", `${reason}${note ? ` — ${note}` : ""}`);
  await notify(post.created_by, {
    kind: "error",
    title: "Story not accepted",
    body: `${post.title} — ${reason}`,
    href: "/newsroom",
  });
  await audit(actor, "Rejected", { type: "article", id: post.id, label: post.title }, reason);
}

export async function approveStory(post: Post, actor: Actor) {
  await setStatus(post.id, {
    status: "approved",
    approved_by: actor.userId ?? null,
    approved_at: new Date().toISOString(),
  });
  await logEvent(post.id, actor, "approved");
  await notify(post.created_by, {
    kind: "success",
    title: "Story approved",
    body: post.title,
    href: "/newsroom",
  });
  await audit(actor, "Approved", { type: "article", id: post.id, label: post.title });
}

export async function scheduleStory(post: Post, actor: Actor, when: string) {
  await setStatus(post.id, { status: "scheduled", scheduled_for: when });
  await logEvent(post.id, actor, "scheduled", new Date(when).toLocaleString());
  await notify(post.created_by, {
    title: "Story scheduled",
    body: post.title,
    href: "/newsroom",
  });
  await audit(actor, "Scheduled", { type: "article", id: post.id, label: post.title });
}

export async function publishStory(post: Post, actor: Actor) {
  await setStatus(post.id, {
    status: "published",
    published_at: post.published_at ?? new Date().toISOString(),
    published_by: actor.userId ?? null,
  });
  await logEvent(post.id, actor, "published");
  await notify(post.created_by, {
    kind: "success",
    title: "Story published",
    body: post.title,
    href: `/article/${post.slug}`,
  });
  await audit(actor, "Published", { type: "article", id: post.id, label: post.title });
}

export async function addInternalNote(post: Post, actor: Actor, note: string) {
  await db.from("article_feedback").insert({
    post_id: post.id,
    author_id: actor.userId ?? null,
    author_name: actor.name,
    kind: "internal_note",
    body: note,
    internal: true,
  });
  await logEvent(post.id, actor, "internal_note");
}

export async function recordCreated(postId: string, actor: Actor, title: string) {
  await logEvent(postId, actor, "created", title);
}

export { audit as recordAudit, notify as sendNotification };

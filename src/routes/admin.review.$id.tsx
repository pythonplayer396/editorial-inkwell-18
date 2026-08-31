import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, textareaClass, inputClass } from "@/components/admin/AdminUI";
import { StatusBadge } from "@/components/newsroom/StatusBadge";
import { Timeline } from "@/components/newsroom/Timeline";
import { BlockRenderer } from "@/components/article/BlockRenderer";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatDateTime, timeAgo } from "@/lib/format";
import { useT } from "@/lib/i18n";
import {
  storyFeedbackQuery,
  storyTimelineQuery,
  submissionsQuery,
} from "@/lib/newsroom";
import { adminPostQuery } from "@/lib/queries";
import {
  REJECTION_REASONS,
  addInternalNote,
  approveStory,
  publishStory,
  rejectStory,
  requestChanges,
  scheduleStory,
  startReview,
} from "@/lib/workflow";

export const Route = createFileRoute("/admin/review/$id")({
  component: ReviewWorkspace,
});

function ReviewWorkspace() {
  const { id } = Route.useParams();
  const t = useT();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { userId, profile } = useCurrentUser();
  const actor = { userId, name: profile?.display_name ?? "An editor" };

  const post = useQuery(adminPostQuery(id));
  const timeline = useQuery(storyTimelineQuery(id));
  const feedback = useQuery(storyFeedbackQuery(id, true));
  const queue = useQuery(submissionsQuery);

  const [note, setNote] = useState("");
  const [internal, setInternal] = useState("");
  const [reason, setReason] = useState<string>(REJECTION_REASONS[0]);
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [panel, setPanel] = useState<null | "changes" | "reject" | "schedule">(null);

  const story = post.data ?? null;

  useEffect(() => {
    if (story && story.status === "submitted" && userId) {
      void startReview(story, actor).then(() => {
        void qc.invalidateQueries({ queryKey: ["admin", "post", id] });
        void qc.invalidateQueries({ queryKey: ["story", "timeline", id] });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, story?.status, userId]);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin"] });
    void qc.invalidateQueries({ queryKey: ["staff"] });
    void qc.invalidateQueries({ queryKey: ["story"] });
  };

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(label);
      setPanel(null);
      setNote("");
      refresh();
    } catch {
      toast.error(`We couldn't ${label.toLowerCase()}`, {
        description: "Nothing was lost. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const pending = (queue.data ?? []).filter((p) => p.id !== id);
  const nextStory = pending[0];

  if (post.isLoading) {
    return <div className="px-5 py-10 text-sm text-muted-foreground">Opening the story…</div>;
  }
  if (!story) {
    return (
      <div className="px-5 py-10">
        <p className="text-sm text-muted-foreground">This story is no longer available.</p>
        <Link to="/admin/submissions" className="story-link mt-3 inline-block text-sm underline underline-offset-4">
          Back to submissions
        </Link>
      </div>
    );
  }

  const words = (story.body ?? [])
    .map((b) => JSON.stringify(b))
    .join(" ")
    .split(/\s+/).length;

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <Link to="/admin/submissions" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← {t("staff.queue")}
        </Link>
        <StatusBadge status={story.status} className="ml-auto" />
        {nextStory ? (
          <Link
            to="/admin/review/$id"
            params={{ id: nextStory.id }}
            className="text-sm font-medium underline underline-offset-4"
          >
            {t("action.next")} →
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-4 flex items-center gap-2">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={`rounded-sm border px-2.5 py-1 text-xs font-medium capitalize transition-all duration-200 ${
                  device === d ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"
                }`}
              >
                {d}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {words} words · {story.reading_minutes} {t("common.minRead")}
            </span>
          </div>

          <article
            className={`premium-surface p-6 transition-all duration-300 ${
              device === "mobile" ? "mx-auto max-w-sm" : ""
            }`}
          >
            {story.category ? <p className="kicker">{story.category.name}</p> : null}
            <h1 className="headline mt-2 text-3xl leading-tight">{story.title}</h1>
            {story.subtitle ? (
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{story.subtitle}</p>
            ) : null}
            {story.cover_url ? (
              <img
                src={story.cover_url}
                alt={story.cover_caption ?? ""}
                className="image-reveal mt-5 w-full rounded-sm object-cover"
              />
            ) : null}
            <div className="prose-article mt-6">
              <BlockRenderer blocks={story.body ?? []} />
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <div className="premium-surface p-4">
            <p className="kicker">Story details</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row label="Author" value={story.author?.display_name ?? "—"} />
              <Row label="Section" value={story.category?.name ?? "—"} />
              <Row label="Submitted" value={formatDateTime(story.submitted_at) || "—"} />
              <Row label="Last edited" value={timeAgo(story.updated_at)} />
            </dl>
          </div>

          <div className="premium-surface space-y-2 p-4">
            <p className="kicker">Decision</p>
            <Btn
              className="w-full"
              disabled={busy}
              onClick={() => run("Approved the story", () => approveStory(story, actor))}
            >
              {t("action.approve")}
            </Btn>
            <Btn
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => setPanel(panel === "changes" ? null : "changes")}
            >
              {t("action.requestChanges")}
            </Btn>
            <div className="grid grid-cols-2 gap-2">
              <Btn
                variant="outline"
                disabled={busy || story.status !== "approved"}
                onClick={() => setPanel(panel === "schedule" ? null : "schedule")}
              >
                {t("action.schedule")}
              </Btn>
              <Btn
                variant="outline"
                disabled={busy || story.status !== "approved"}
                onClick={() =>
                  run("Published the story", async () => {
                    await publishStory(story, actor);
                    void navigate({ to: "/admin/submissions" });
                  })
                }
              >
                {t("action.publish")}
              </Btn>
            </div>
            <Btn
              variant="danger"
              className="w-full"
              disabled={busy}
              onClick={() => setPanel(panel === "reject" ? null : "reject")}
            >
              {t("action.reject")}
            </Btn>
            <Link to="/admin/posts/$id" params={{ id: story.id }} className="block">
              <Btn variant="ghost" className="w-full">
                {t("action.edit")}
              </Btn>
            </Link>

            {panel === "changes" ? (
              <div className="animate-in fade-in slide-in-from-top-1 space-y-2 border-t border-border pt-3 duration-200">
                <Field label={t("staff.feedbackToJournalist")} hint="The journalist sees this note.">
                  <textarea
                    rows={4}
                    className={textareaClass}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Please verify the source used in paragraph three and revise the headline."
                  />
                </Field>
                <Btn
                  className="w-full"
                  disabled={busy || note.trim().length < 5}
                  onClick={() => run("Requested changes", () => requestChanges(story, actor, note.trim()))}
                >
                  Send feedback
                </Btn>
              </div>
            ) : null}

            {panel === "reject" ? (
              <div className="animate-in fade-in slide-in-from-top-1 space-y-2 border-t border-border pt-3 duration-200">
                <Field label={t("common.reason")}>
                  <select
                    className={inputClass}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {REJECTION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("common.note")}>
                  <textarea rows={3} className={textareaClass} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
                <Btn
                  variant="danger"
                  className="w-full"
                  disabled={busy}
                  onClick={() => run("Rejected the story", () => rejectStory(story, actor, reason, note.trim()))}
                >
                  Confirm rejection
                </Btn>
              </div>
            ) : null}

            {panel === "schedule" ? (
              <div className="animate-in fade-in slide-in-from-top-1 space-y-2 border-t border-border pt-3 duration-200">
                <Field label="Publish at">
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                  />
                </Field>
                <Btn
                  className="w-full"
                  disabled={busy || !when}
                  onClick={() =>
                    run("Scheduled the story", () =>
                      scheduleStory(story, actor, new Date(when).toISOString()),
                    )
                  }
                >
                  Confirm schedule
                </Btn>
              </div>
            ) : null}
          </div>

          <div className="premium-surface p-4">
            <p className="kicker">{t("staff.internalNotes")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Private to the desk. Journalists never see these.
            </p>
            <textarea
              rows={3}
              className={`${textareaClass} mt-2`}
              value={internal}
              onChange={(e) => setInternal(e.target.value)}
              placeholder="Verify image source before publication."
            />
            <Btn
              variant="outline"
              className="mt-2 w-full"
              disabled={busy || internal.trim().length < 3}
              onClick={() =>
                run("Saved the note", async () => {
                  await addInternalNote(story, actor, internal.trim());
                  setInternal("");
                })
              }
            >
              Add note
            </Btn>
            <ul className="mt-3 space-y-2">
              {(feedback.data ?? []).map((f) => (
                <li key={f.id} className="border-t border-border pt-2 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {f.internal ? "Internal" : "To journalist"} · {f.author_name} · {timeAgo(f.created_at)}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="premium-surface p-4">
            <p className="kicker mb-3">{t("common.timeline")}</p>
            <Timeline events={timeline.data ?? []} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium">{value}</dd>
    </div>
  );
}

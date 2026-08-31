import type { ArticleEvent } from "@/lib/types";

const ACTION_LABELS: Record<string, string> = {
  created: "Story created",
  submitted: "Submitted for review",
  resubmitted: "Resubmitted",
  review_started: "Opened by an editor",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  internal_note: "Internal note added",
  edited: "Story edited",
};

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Timeline({ events }: { events: ArticleEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing has happened yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li
          key={e.id}
          className="editorial-enter relative"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <span
            aria-hidden
            className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full border border-border bg-background"
          />
          <p className="text-sm font-medium">{ACTION_LABELS[e.action] ?? e.action}</p>
          <p className="text-xs text-muted-foreground">
            {e.actor_name ? `by ${e.actor_name} · ` : ""}
            {when(e.created_at)}
          </p>
          {e.detail ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

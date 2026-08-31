import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/admin/AdminUI";
import { StatusBadge } from "@/components/newsroom/StatusBadge";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { timeAgo } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { submissionsQuery } from "@/lib/newsroom";

export const Route = createFileRoute("/admin/submissions")({
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const t = useT();
  const q = useQuery(submissionsQuery);
  const rows = q.data ?? [];

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={t("staff.queue")}
        description="Stories waiting on the editorial desk, oldest first."
      />

      {q.isLoading ? (
        <StoryListSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState title={t("empty.reviews")} description={t("staff.queueEmpty")} />
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {rows.map((p, i) => (
            <li
              key={p.id}
              className="editorial-enter grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-3"
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
            >
              <div className="h-14 w-20 overflow-hidden rounded-sm border border-border bg-muted">
                {p.cover_url ? (
                  <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.title || "Untitled story"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.author?.display_name ?? "Unassigned"}
                  {p.category ? ` · ${p.category.name}` : ""} · submitted{" "}
                  {timeAgo(p.submitted_at ?? p.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <Link
                  to="/admin/review/$id"
                  params={{ id: p.id }}
                  className="pressable inline-flex h-9 items-center rounded-sm bg-primary px-3.5 text-sm font-medium text-primary-foreground"
                >
                  {t("action.review")}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

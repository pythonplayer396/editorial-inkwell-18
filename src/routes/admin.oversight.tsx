import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PageHeader, StatCard } from "@/components/admin/AdminUI";
import { StatusBadge } from "@/components/newsroom/StatusBadge";
import { EmptyState } from "@/components/ui-kit/States";
import { timeAgo } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { recentActivityQuery, staffDirectoryQuery, submissionsQuery } from "@/lib/newsroom";
import { adminPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/oversight")({
  component: OversightPage,
});

function OversightPage() {
  const t = useT();
  const posts = useQuery(adminPostsQuery);
  const queue = useQuery(submissionsQuery);
  const activity = useQuery(recentActivityQuery);
  const people = useQuery(staffDirectoryQuery);

  const all = posts.data ?? [];
  const today = new Date().toDateString();
  const publishedToday = all.filter(
    (p) => p.published_at && new Date(p.published_at).toDateString() === today,
  );
  const staff = (people.data ?? []).filter((p) =>
    p.roles.some((r) => ["owner", "editor"].includes(r)),
  );
  const journalists = (people.data ?? []).filter((p) =>
    p.roles.some((r) => ["author", "contributor"].includes(r)),
  );

  const events = activity.data ?? [];
  const of = (action: string) => events.filter((e) => e.action.toLowerCase().includes(action));

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={t("admin.oversight")}
        description="What's waiting, what went out, and who made the call."
        actions={
          <Link to="/admin/audit" className="pressable inline-flex h-9 items-center rounded-sm border border-border px-3.5 text-sm font-medium">
            {t("nav.audit")}
          </Link>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("admin.pendingSubmissions")} value={(queue.data ?? []).length} sub="Awaiting the desk" />
        <StatCard label={t("admin.publishedToday")} value={publishedToday.length} sub="Live since midnight" />
        <StatCard label={t("admin.activeJournalists")} value={journalists.length} sub="With writing access" />
        <StatCard label={t("admin.activeStaff")} value={staff.length} sub="Editors and owners" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="kicker border-b border-border-strong pb-2">{t("admin.whoDidWhat")}</h2>
          {events.length === 0 ? (
            <EmptyState
              title="No newsroom activity yet"
              description="Approvals, rejections and publications will be listed here as they happen."
            />
          ) : (
            <ul className="divide-y divide-border border-b border-border">
              {events.slice(0, 25).map((e, i) => (
                <li
                  key={e.id}
                  className="editorial-enter grid grid-cols-[minmax(0,10rem)_minmax(0,8rem)_minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-sm"
                  style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
                >
                  <span className="truncate font-medium">{e.actor_name ?? "System"}</span>
                  <span className="truncate text-muted-foreground">{e.action}</span>
                  <span className="truncate">{e.entity_label ?? e.entity_type}</span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {timeAgo(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <div className="premium-surface p-4">
            <p className="kicker">In the queue</p>
            <ul className="mt-3 space-y-2">
              {(queue.data ?? []).slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <StatusBadge status={p.status} />
                  <Link
                    to="/admin/review/$id"
                    params={{ id: p.id }}
                    className="min-w-0 flex-1 truncate underline-offset-4 hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              {(queue.data ?? []).length === 0 ? (
                <li className="text-sm text-muted-foreground">Nothing waiting.</li>
              ) : null}
            </ul>
          </div>

          <div className="premium-surface grid grid-cols-3 divide-x divide-border">
            <Mini label="Approvals" value={of("approv").length} />
            <Mini label="Changes" value={of("change").length} />
            <Mini label="Rejections" value={of("reject").length} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 text-center">
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

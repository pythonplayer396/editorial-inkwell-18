import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, StatCard } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui-kit/States";
import { compactNumber, formatDate } from "@/lib/format";
import { adminPostsQuery, categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const posts = useQuery(adminPostsQuery);
  const categories = useQuery(categoriesQuery);

  const published = (posts.data ?? []).filter((p) => p.status === "published");
  const views = published.reduce((s, p) => s + (p.view_count ?? 0), 0);
  const avg = published.length ? Math.round(views / published.length) : 0;
  const minutes = published.reduce((s, p) => s + (p.reading_minutes ?? 0), 0);
  const max = Math.max(1, ...published.map((p) => p.view_count ?? 0));

  const bySection = (categories.data ?? [])
    .map((c) => ({
      name: c.name,
      views: published
        .filter((p) => p.category_id === c.id)
        .reduce((s, p) => s + (p.view_count ?? 0), 0),
      count: published.filter((p) => p.category_id === c.id).length,
    }))
    .sort((a, b) => b.views - a.views);
  const sectionMax = Math.max(1, ...bySection.map((s) => s.views));

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Analytics"
        description="How the published work is being read, section by section."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total views" value={compactNumber(views)} />
        <StatCard label="Published stories" value={published.length} />
        <StatCard label="Average per story" value={compactNumber(avg)} />
        <StatCard label="Words in print" value={`${minutes} min`} sub="Total reading time" />
      </div>

      {published.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No readership data yet"
            description="Numbers appear here once your first article is published and read."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="border border-border p-4">
            <h2 className="text-sm font-semibold">Most read</h2>
            <ul className="mt-4 space-y-3">
              {[...published]
                .sort((a, b) => b.view_count - a.view_count)
                .slice(0, 8)
                .map((p) => (
                  <li key={p.id}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                      <span className="truncate">{p.title}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {compactNumber(p.view_count)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-muted">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.round(((p.view_count ?? 0) / max) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.category?.name ?? "Unassigned"} · {formatDate(p.published_at)}
                    </p>
                  </li>
                ))}
            </ul>
          </section>

          <section className="border border-border p-4">
            <h2 className="text-sm font-semibold">By section</h2>
            <ul className="mt-4 space-y-3">
              {bySection.map((s) => (
                <li key={s.name}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                    <span className="truncate">{s.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {compactNumber(s.views)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-muted">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${Math.round((s.views / sectionMax) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.count} article{s.count === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Btn, PageHeader, StatCard, StatusPill } from "@/components/admin/AdminUI";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { useCurrentUser } from "@/hooks/useAuth";
import { compactNumber, timeAgo } from "@/lib/format";
import { adminCommentsQuery, adminPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = useCurrentUser();
  const posts = useQuery(adminPostsQuery);
  const comments = useQuery(adminCommentsQuery);

  const all = posts.data ?? [];
  const published = all.filter((p) => p.status === "published");
  const drafts = all.filter((p) => p.status === "draft");
  const scheduled = all.filter((p) => p.status === "scheduled");
  const inReview = all.filter((p) => p.status === "in_review");
  const pending = (comments.data ?? []).filter((c) => c.status === "pending");
  const views = published.reduce((sum, p) => sum + (p.view_count ?? 0), 0);

  const firstName = profile?.display_name?.split(" ")[0];

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={firstName ? `Good day, ${firstName}` : "Dashboard"}
        description="What's live, what's waiting, and what needs your attention."
        actions={
          <>
            <Link to="/admin/media">
              <Btn variant="outline">Upload media</Btn>
            </Link>
            <Link to="/admin/posts/$id" params={{ id: "new" }}>
              <Btn>Write article</Btn>
            </Link>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Published" value={published.length} sub="Live on the site" />
        <StatCard label="Drafts" value={drafts.length} sub="Not yet submitted" />
        <StatCard label="Scheduled" value={scheduled.length} sub="Queued to publish" />
        <StatCard label="Total views" value={compactNumber(views)} sub="Across published work" />
        <StatCard
          label="Needs moderation"
          value={pending.length}
          sub={pending.length ? "Comments awaiting review" : "Nothing waiting"}
        />
      </div>

      {inReview.length > 0 || pending.length > 0 ? (
        <section className="mt-8 border border-warning/30 bg-warning/5 p-4">
          <p className="text-sm font-semibold">Needs your attention</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {inReview.length > 0 ? (
              <li>
                {inReview.length} article{inReview.length === 1 ? "" : "s"} waiting for review —{" "}
                <Link to="/admin/posts" className="text-foreground underline underline-offset-4">
                  open the queue
                </Link>
              </li>
            ) : null}
            {pending.length > 0 ? (
              <li>
                {pending.length} comment{pending.length === 1 ? "" : "s"} pending —{" "}
                <Link to="/admin/comments" className="text-foreground underline underline-offset-4">
                  moderate now
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Recent articles</h2>
          <Link to="/admin/posts" className="text-xs text-muted-foreground hover:text-foreground">
            All articles →
          </Link>
        </div>

        {posts.isLoading ? (
          <StoryListSkeleton count={4} />
        ) : all.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description="Start publishing your first story. It takes a headline and a paragraph to begin."
            action={
              <Link to="/admin/posts/$id" params={{ id: "new" }}>
                <Btn>Write an article</Btn>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden border border-border bg-background">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-3 py-2 font-medium md:table-cell">Section</th>
                  <th className="hidden px-3 py-2 text-right font-medium lg:table-cell">Views</th>
                  <th className="px-3 py-2 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {all.slice(0, 8).map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-secondary-accent-soft/35">
                    <td className="max-w-0 px-3 py-2.5">
                      <Link
                        to="/admin/posts/$id"
                        params={{ id: p.id }}
                        className="block truncate font-medium transition-colors hover:text-secondary-accent"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="hidden px-3 py-2.5 text-right tabular-nums text-muted-foreground lg:table-cell">
                      {compactNumber(p.view_count)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-muted-foreground">
                      {timeAgo(p.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
         <div className="premium-surface p-4">
          <p className="text-sm font-semibold">Top performing</p>
          <ol className="mt-3 space-y-2.5">
            {[...published]
              .sort((a, b) => b.view_count - a.view_count)
              .slice(0, 5)
              .map((p, i) => (
                <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span className="truncate text-sm">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {p.title}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {compactNumber(p.view_count)} views
                  </span>
                </li>
              ))}
            {published.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Nothing published yet — performance appears here after your first story goes live.
              </li>
            ) : null}
          </ol>
        </div>

         <div className="premium-surface p-4">
          <p className="text-sm font-semibold">Scheduled next</p>
          <ul className="mt-3 space-y-2.5">
            {scheduled.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Nothing scheduled. You can set a publish time from the article editor.
              </li>
            ) : (
              scheduled.map((p) => (
                <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <Link
                    to="/admin/posts/$id"
                    params={{ id: p.id }}
                    className="truncate text-sm hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {timeAgo(p.scheduled_for)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

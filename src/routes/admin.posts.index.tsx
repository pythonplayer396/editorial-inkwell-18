import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Btn, PageHeader, StatusPill, inputClass } from "@/components/admin/AdminUI";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { compactNumber, timeAgo } from "@/lib/format";
import { adminPostsQuery } from "@/lib/queries";
import { STATUS_LABELS, type PostStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/posts/")({
  component: PostsPage,
});

const FILTERS: Array<PostStatus | "all"> = [
  "all",
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
];

function PostsPage() {
  const posts = useQuery(adminPostsQuery);
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const list = posts.data ?? [];
    return list.filter(
      (p) =>
        (filter === "all" || p.status === filter) &&
        (!q.trim() || p.title.toLowerCase().includes(q.trim().toLowerCase())),
    );
  }, [posts.data, filter, q]);

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Articles"
        description="Everything written for The Dispatch, from first draft to archive."
        actions={
          <Link to="/admin/posts/$id" params={{ id: "new" }}>
            <Btn>New article</Btn>
          </Link>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                filter === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }`}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles…"
          className={inputClass}
        />
      </div>

      <div className="mt-5">
        {posts.isLoading ? (
          <StoryListSkeleton count={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No articles here"
            description="Try a different filter, or start something new."
            action={
              <Link to="/admin/posts/$id" params={{ id: "new" }}>
                <Btn>New article</Btn>
              </Link>
            }
          />
        ) : (
          <div className="border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-3 py-2 font-medium lg:table-cell">Author</th>
                  <th className="hidden px-3 py-2 font-medium md:table-cell">Section</th>
                  <th className="hidden px-3 py-2 text-right font-medium lg:table-cell">Views</th>
                  <th className="px-3 py-2 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="max-w-0 px-3 py-2.5">
                      <Link
                        to="/admin/posts/$id"
                        params={{ id: p.id }}
                        className="block truncate font-medium hover:text-accent"
                      >
                        {p.title}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">
                        /{p.slug}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-muted-foreground lg:table-cell">
                      {p.author?.display_name ?? "Unassigned"}
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
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { StatCard } from "@/components/admin/AdminUI";
import { StatusBadge } from "@/components/newsroom/StatusBadge";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { useCurrentUser } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { myFeedbackQuery, myStoriesQuery } from "@/lib/newsroom";
import { nextStepFor } from "@/lib/workflow";

export const Route = createFileRoute("/newsroom/")({
  component: JournalistDashboard,
});

function JournalistDashboard() {
  const t = useT();
  const { userId, profile } = useCurrentUser();
  const stories = useQuery(myStoriesQuery(userId));
  const feedback = useQuery(myFeedbackQuery(userId));

  const all = stories.data ?? [];
  const by = (s: string) => all.filter((p) => p.status === s);
  const attention = all.filter((p) => p.status === "changes_requested" || p.status === "rejected");
  const firstName = profile?.display_name?.split(" ")[0];

  return (
    <div className="editorial-enter">
      <header className="border-b border-border pb-5">
        <p className="kicker">{t("brand.newsroom")}</p>
        <h1 className="headline mt-2 text-3xl">
          {firstName ? `Good day, ${firstName}` : t("journalist.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("journalist.subtitle")}</p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label={t("journalist.drafts")} value={by("draft").length} sub="Not sent yet" />
        <StatCard
          label={t("journalist.underReview")}
          value={by("submitted").length + by("under_review").length}
          sub="With an editor"
        />
        <StatCard
          label={t("journalist.changesRequested")}
          value={by("changes_requested").length}
          sub={by("changes_requested").length ? "Needs your edit" : "Nothing waiting"}
        />
        <StatCard label={t("journalist.approved")} value={by("approved").length} sub="Cleared to run" />
        <StatCard label={t("journalist.published")} value={by("published").length} sub="Live on the site" />
      </div>

      {attention.length > 0 ? (
        <section className="editorial-enter mt-8 rounded-sm border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm font-semibold">{t("journalist.needsAttention")}</p>
          <ul className="mt-3 space-y-2">
            {attention.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 text-sm">
                <StatusBadge status={p.status} />
                <span className="font-medium">{p.title}</span>
                <span className="text-muted-foreground">{nextStepFor(p.status)}</span>
                <Link
                  to="/admin/posts/$id"
                  params={{ id: p.id }}
                  className="story-link ml-auto font-medium underline underline-offset-4"
                >
                  {t("action.edit")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <h2 className="kicker border-b border-border-strong pb-2">My stories</h2>
          {stories.isLoading ? (
            <StoryListSkeleton />
          ) : all.length === 0 ? (
            <EmptyState
              title={t("empty.stories")}
              description={t("empty.storiesHint")}
              action={
                <Link
                  to="/admin/posts/$id"
                  params={{ id: "new" }}
                  className="pressable inline-flex h-9 items-center rounded-sm bg-primary px-3.5 text-sm font-medium text-primary-foreground"
                >
                  {t("nav.write")}
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border border-b border-border">
              {all.map((p, i) => (
                <li
                  key={p.id}
                  className="editorial-enter flex flex-wrap items-center gap-3 py-3"
                  style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title || "Untitled story"}</p>
                    <p className="text-xs text-muted-foreground">
                      {nextStepFor(p.status) ?? "No action needed"} · edited {timeAgo(p.updated_at)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                  <Link
                    to="/admin/posts/$id"
                    params={{ id: p.id }}
                    className="text-sm font-medium underline underline-offset-4"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="kicker border-b border-border-strong pb-2">
              {t("journalist.recentFeedback")}
            </h2>
            {(feedback.data ?? []).length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No editor feedback yet. You'll see notes here when an editor reviews your work.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {(feedback.data ?? []).slice(0, 6).map((f) => (
                  <li key={f.id} className="py-3">
                    <p className="text-xs text-muted-foreground">
                      {f.author_name} · {timeAgo(f.created_at)}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{f.body}</p>
                    {f.post ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">on “{f.post.title}”</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="premium-surface p-4">
            <p className="text-sm font-semibold">What happens after I submit?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              An editor reads your story in full. They'll either send it back with specific notes, or
              approve it and schedule it to run. Nothing publishes without that review — that's what
              makes the byline count.
            </p>
            <Link to="/join" className="story-link mt-3 inline-block text-sm underline underline-offset-4">
              Read the full process
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

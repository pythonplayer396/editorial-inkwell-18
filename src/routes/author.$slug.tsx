import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Container, PublicLayout, SectionHeading } from "@/components/site/PublicLayout";
import { StoryCard, StoryRow } from "@/components/site/StoryCard";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { profileBySlugQuery, publishedPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/author/$slug")({
  head: ({ params }) => {
    const label = params.slug.replace(/-/g, " ");
    const title = `${label} — reporter at The Dispatch`;
    const description = `Profile, biography and published work by ${label} at The Dispatch.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  component: AuthorPage,
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const profile = useQuery(profileBySlugQuery(slug));
  const posts = useQuery(publishedPostsQuery({ authorSlug: slug, limit: 30, key: "author" }));
  const list = posts.data ?? [];
  const featured = list
    .filter((p) => p.is_editors_pick || p.is_featured)
    .slice(0, 3);
  const featuredIds = new Set(featured.map((p) => p.id));
  const rest = list.filter((p) => !featuredIds.has(p.id));
  const areas = profile.data?.coverage_areas ?? [];

  return (
    <PublicLayout>
      <Container className="py-10">
        <header className="grid gap-6 border-b border-border pb-8 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
            {profile.data?.avatar_url ? (
              <img
                src={profile.data.avatar_url}
                alt={profile.data.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-muted-foreground">
                {(profile.data?.display_name ?? slug).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="kicker text-accent">{profile.data?.job_title ?? "Contributor"}</p>
            <h1 className="headline mt-1 text-3xl md:text-4xl">
              {profile.data?.display_name ?? slug.replace(/-/g, " ")}
            </h1>
            {profile.data?.bio ? (
              <p className="mt-3 max-w-2xl font-serif text-[1.05rem] leading-relaxed text-muted-foreground">
                {profile.data.bio}
              </p>
            ) : null}
            {areas.length ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {areas.map((a) => (
                  <li
                    key={a}
                    className="rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                {list.length} published {list.length === 1 ? "story" : "stories"}
              </span>
              {profile.data?.email ? (
                <a href={`mailto:${profile.data.email}`} className="hover:text-accent">
                  {profile.data.email}
                </a>
              ) : null}
              {profile.data?.twitter ? (
                <a
                  href={`https://x.com/${profile.data.twitter}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent"
                >
                  @{profile.data.twitter}
                </a>
              ) : null}
            </p>
          </div>
        </header>

        {featured.length ? (
          <div className="mt-10">
            <SectionHeading title="Featured work" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <StoryCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <SectionHeading title="Published work" />
          {posts.isLoading ? (
            <StoryListSkeleton count={4} />
          ) : list.length === 0 ? (
            <EmptyState
              title="No published stories yet"
              description="Work by this reporter will appear here once it is published."
            />
          ) : (
            <div className="divide-y divide-border">
              {(featured.length ? rest : list).map((p) => (
                <StoryRow key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </PublicLayout>
  );
}

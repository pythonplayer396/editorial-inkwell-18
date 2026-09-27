import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Container, PublicLayout, SectionHeading } from "@/components/site/PublicLayout";
import { Newsletter } from "@/components/site/Newsletter";
import { LeadStory, StoryCard, StoryRow } from "@/components/site/StoryCard";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import {
  categoriesQuery,
  editorsPicksQuery,
  mostReadQuery,
  publishedPostsQuery,
} from "@/lib/queries";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Dispatch — Independent reporting, carefully told" },
      {
        name: "description",
        content:
          "Original reporting on national politics, business, technology and culture from The Dispatch newsroom.",
      },
      { property: "og:title", content: "The Dispatch — Independent reporting, carefully told" },
      {
        property: "og:description",
        content:
          "Original reporting on national politics, business, technology and culture from The Dispatch newsroom.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const posts = useQuery(publishedPostsQuery({ limit: 24, key: "home" }));
  const mostRead = useQuery(mostReadQuery);
  const picks = useQuery(editorsPicksQuery);
  const categories = useQuery(categoriesQuery);

  const all: Post[] = posts.data ?? [];
  const lead = all.find((p) => p.is_featured) ?? all[0];
  const secondary = all.filter((p) => p.id !== lead?.id).slice(0, 3);
  const latest = all.filter((p) => p.id !== lead?.id).slice(3, 11);

  return (
    <PublicLayout>
      <Container className="py-7 md:py-9">
        <div className="mb-5 border-b border-border pb-3">
          <h1 className="border-l-8 border-news-brand pl-4 text-3xl font-bold sm:text-4xl">
            Top stories
          </h1>
        </div>
        {posts.isLoading ? (
          <StoryListSkeleton count={3} />
        ) : !lead ? (
          <EmptyState
            title="No stories published yet"
            description="Once the newsroom publishes its first story, it will lead this page."
            action={
              <Link
                to="/admin"
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Open the newsroom
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-7 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
              <div className="min-w-0">
                <LeadStory post={lead} />
              </div>
              <aside className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <div className="flex items-center justify-between border-b-4 border-news-brand pb-2">
                  <p className="text-xl font-bold">More top stories</p>
                  <Link to="/latest" className="text-xs font-semibold hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-border">
                  {secondary.map((p) => (
                    <div key={p.id} className="py-5">
                      <StoryCard post={p} size="sm" showImage={false} />
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </>
        )}
      </Container>

      <div className="border-y border-border bg-news-surface">
      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <section aria-labelledby="latest-heading">
          <SectionHeading
            title="Latest"
            href={
              <Link to="/latest" className="text-xs text-muted-foreground hover:text-accent">
                All stories →
              </Link>
            }
          />
          {posts.isLoading ? (
            <StoryListSkeleton />
          ) : latest.length === 0 ? (
            <EmptyState
              title="Nothing else in the feed"
              description="New reporting appears here as soon as it is published."
            />
          ) : (
            <div className="divide-y divide-border">
              {latest.slice(0, 6).map((p, i) => (
                <StoryRow key={p.id} post={p} index={i} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-10 lg:border-l lg:border-border lg:pl-8">
          <section aria-labelledby="most-read-heading">
            <SectionHeading title="Most read" />
            {mostRead.isLoading ? (
              <StoryListSkeleton count={3} />
            ) : (
              <ol className="divide-y divide-border">
                {(mostRead.data ?? []).map((p, i) => (
                  <li key={p.id}>
                    <div className="py-4">
                      <div className="flex gap-3">
                        <span className="text-3xl font-bold leading-none text-news-brand">
                          {i + 1}
                        </span>
                        <h3 className="headline text-[0.98rem] leading-snug">
                          <Link
                            to="/article/$slug"
                            params={{ slug: p.slug }}
                            className="hover:underline"
                          >
                            {p.title}
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="picks-heading">
            <SectionHeading title="Editor's picks" />
            {(picks.data ?? []).length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Selected stories will be highlighted here.
              </p>
            ) : (
              <div className="space-y-5 divide-y divide-border">
                {(picks.data ?? []).map((p) => (
                  <div key={p.id} className="pt-5 first:pt-0">
                    <StoryCard post={p} size="sm" showImage={false} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </Container>
      </div>

      <Newsletter />

      <Container className="py-12">
        <div className="space-y-12">
          {(categories.data ?? []).map((cat) => (
            <CategoryStrip key={cat.id} slug={cat.slug} name={cat.name} />
          ))}
        </div>
      </Container>
    </PublicLayout>
  );
}

function CategoryStrip({ slug, name }: { slug: string; name: string }) {
  const { data, isLoading } = useQuery(publishedPostsQuery({ categorySlug: slug, limit: 4, key: "strip" }));
  if (isLoading || !data || data.length === 0) return null;
  return (
    <section aria-label={name}>
      <SectionHeading
        title={name}
        href={
          <Link
            to="/category/$slug"
            params={{ slug }}
            className="text-xs text-muted-foreground hover:text-accent"
          >
            More {name} →
          </Link>
        }
      />
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((p) => (
          <StoryCard key={p.id} post={p} size="sm" />
        ))}
      </div>
    </section>
  );
}

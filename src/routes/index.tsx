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
      <Container className="py-8 md:py-12">
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
            <LeadStory post={lead} />
            {secondary.length > 0 ? (
              <div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-3 md:gap-10">
                {secondary.map((p) => (
                  <StoryCard key={p.id} post={p} showExcerpt />
                ))}
              </div>
            ) : null}
          </>
        )}
      </Container>

      <Container className="grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
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
              {latest.map((p) => (
                <StoryRow key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-12">
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
                        <span className="font-mono text-xs text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="headline text-[0.98rem] leading-snug">
                          <Link
                            to="/article/$slug"
                            params={{ slug: p.slug }}
                            className="hover:text-accent"
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

      <Newsletter />

      <Container className="py-16">
        <div className="space-y-14">
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
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((p) => (
          <StoryCard key={p.id} post={p} size="sm" />
        ))}
      </div>
    </section>
  );
}

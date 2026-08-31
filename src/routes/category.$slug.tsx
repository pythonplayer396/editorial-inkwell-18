import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Container, PublicLayout, SectionHeading } from "@/components/site/PublicLayout";
import { LeadStory, StoryRow } from "@/components/site/StoryCard";
import { FollowButton } from "@/components/site/FollowButton";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { categoryBySlugQuery, publishedPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const label = params.slug.replace(/-/g, " ");
    const title = `${label.charAt(0).toUpperCase()}${label.slice(1)} — The Dispatch`;
    const description = `Reporting and analysis on ${label} from The Dispatch.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [limit, setLimit] = useState(12);
  const category = useQuery(categoryBySlugQuery(slug));
  const posts = useQuery(publishedPostsQuery({ categorySlug: slug, limit, key: "category" }));

  const list = posts.data ?? [];
  const lead = list[0];
  const rest = list.slice(1);
  const mostRead = [...list].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  return (
    <PublicLayout>
      <Container className="py-10">
        <header className="border-b-2 border-foreground pb-3">
          <p className="kicker text-accent">Section</p>
          <h1 className="headline mt-1 text-3xl md:text-4xl">
            {category.data?.name ?? slug.replace(/-/g, " ")}
          </h1>
          {category.data?.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {category.data.description}
            </p>
          ) : null}
          {category.data ? (
            <div className="mt-3">
              <FollowButton type="category" id={category.data.id} label="section" />
            </div>
          ) : null}
        </header>

        {posts.isLoading ? (
          <div className="mt-8">
            <StoryListSkeleton count={5} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No stories in this section yet"
            description="Nothing has been filed here so far. Browse the latest reporting instead."
            action={
              <Link
                to="/latest"
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Read the latest
              </Link>
            }
          />
        ) : (
          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            <div>
              {lead ? <LeadStory post={lead} /> : null}
              {rest.length > 0 ? (
                <div className="mt-10 divide-y divide-border border-t border-border">
                  {rest.map((p) => (
                    <StoryRow key={p.id} post={p} />
                  ))}
                </div>
              ) : null}
              {list.length >= limit ? (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setLimit((l) => l + 12)}
                    className="h-10 rounded-sm border border-border px-5 text-sm font-medium hover:bg-muted"
                  >
                    Load more
                  </button>
                </div>
              ) : null}
            </div>

            <aside>
              <SectionHeading title="Most read in this section" />
              <ol className="divide-y divide-border">
                {mostRead.map((p, i) => (
                  <li key={p.id} className="flex gap-3 py-4">
                    <span className="font-mono text-xs text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="headline text-[0.98rem] leading-snug">
                      <Link to="/article/$slug" params={{ slug: p.slug }} className="hover:text-accent">
                        {p.title}
                      </Link>
                    </h3>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        )}
      </Container>
    </PublicLayout>
  );
}

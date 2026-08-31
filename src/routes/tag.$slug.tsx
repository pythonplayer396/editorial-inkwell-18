import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Container, PublicLayout } from "@/components/site/PublicLayout";
import { StoryRow } from "@/components/site/StoryCard";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { publishedPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/tag/$slug")({
  head: ({ params }) => {
    const label = params.slug.replace(/-/g, " ");
    const title = `${label} — coverage from The Dispatch`;
    const description = `Every Dispatch story tagged ${label}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TagPage,
});

function TagPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(publishedPostsQuery({ tagSlug: slug, limit: 30, key: "tag" }));
  const posts = data ?? [];

  return (
    <PublicLayout>
      <Container className="py-10">
        <header className="border-b-2 border-foreground pb-3">
          <p className="kicker text-accent">Topic</p>
          <h1 className="headline mt-1 text-3xl capitalize md:text-4xl">{slug.replace(/-/g, " ")}</h1>
        </header>

        {isLoading ? (
          <div className="mt-8">
            <StoryListSkeleton count={4} />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No stories carry this topic yet"
            description="Try browsing the latest reporting or searching for something more specific."
            action={
              <Link
                to="/search"
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Search stories
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {posts.map((p) => (
              <StoryRow key={p.id} post={p} />
            ))}
          </div>
        )}
      </Container>
    </PublicLayout>
  );
}

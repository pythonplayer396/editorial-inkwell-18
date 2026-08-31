import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Container, PublicLayout } from "@/components/site/PublicLayout";
import { StoryRow } from "@/components/site/StoryCard";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { publishedPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/latest")({
  head: () => ({
    meta: [
      { title: "Latest stories — The Dispatch" },
      {
        name: "description",
        content: "Every story from The Dispatch newsroom, newest first.",
      },
      { property: "og:title", content: "Latest stories — The Dispatch" },
      {
        property: "og:description",
        content: "Every story from The Dispatch newsroom, newest first.",
      },
    ],
  }),
  component: LatestPage,
});

function LatestPage() {
  const [limit, setLimit] = useState(15);
  const { data, isLoading } = useQuery(publishedPostsQuery({ limit, key: "latest" }));
  const posts = data ?? [];

  return (
    <PublicLayout>
      <Container className="py-10">
        <header className="border-b-2 border-foreground pb-3">
          <h1 className="headline text-3xl md:text-4xl">Latest</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything the newsroom has published, newest first.
          </p>
        </header>

        {isLoading ? (
          <StoryListSkeleton count={6} />
        ) : posts.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No stories yet"
            description="The newsroom hasn't published anything so far. Check back shortly."
          />
        ) : (
          <>
            <div className="divide-y divide-border">
              {posts.map((p) => (
                <StoryRow key={p.id} post={p} />
              ))}
            </div>
            {posts.length >= limit ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setLimit((l) => l + 15)}
                  className="h-10 rounded-sm border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Load more stories
                </button>
              </div>
            ) : null}
          </>
        )}
      </Container>
    </PublicLayout>
  );
}

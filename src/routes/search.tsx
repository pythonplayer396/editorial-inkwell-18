import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Container, PublicLayout } from "@/components/site/PublicLayout";
import { StoryRow } from "@/components/site/StoryCard";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { categoriesQuery, searchPostsQuery } from "@/lib/queries";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — The Dispatch" },
      { name: "description", content: "Search stories, reporters and topics across The Dispatch." },
      { property: "og:title", content: "Search — The Dispatch" },
      {
        property: "og:description",
        content: "Search stories, reporters and topics across The Dispatch.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

const RANGES = [
  { label: "Any time", value: "" },
  { label: "Past week", value: "7" },
  { label: "Past month", value: "30" },
  { label: "Past year", value: "365" },
];

function SearchPage() {
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [category, setCategory] = useState("");
  const [range, setRange] = useState("");

  const categories = useQuery(categoriesQuery);
  const since = range
    ? new Date(Date.now() - Number(range) * 86_400_000).toISOString()
    : undefined;

  const results = useQuery({
    ...searchPostsQuery({ q: submitted, category: category || undefined, since }),
    enabled: submitted.trim().length > 0 || Boolean(category) || Boolean(range),
  });

  const list = results.data ?? [];
  const hasQuery = submitted.trim().length > 0 || Boolean(category) || Boolean(range);

  return (
    <PublicLayout>
      <Container className="py-12 sm:py-16">
        <div className="max-w-2xl editorial-enter">
        <p className="kicker text-secondary-accent">The archive</p>
        <h1 className="headline mt-3 text-4xl sm:text-6xl">What are you looking for?</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Find stories by headline, summary, section or date.
        </p>
        </div>

        <form
          className="premium-surface mt-9 grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_160px_auto] md:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(term);
          }}
        >
          <div className="relative">
            <label htmlFor="q" className="sr-only">
              Search stories
            </label>
            <input
              id="q"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search stories…"
              className="h-12 w-full rounded-sm border border-input bg-background pl-11 pr-3 text-sm outline-none transition-all focus-visible:border-secondary-accent focus-visible:ring-4 focus-visible:ring-secondary-accent-soft"
            />
            <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <label htmlFor="cat" className="sr-only">
              Section
            </label>
            <select
              id="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-secondary-accent"
            >
              <option value="">All sections</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="range" className="sr-only">
              Date range
            </label>
            <select
              id="range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-secondary-accent"
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-secondary-accent"
          >
            <SlidersHorizontal className="h-4 w-4" /> Search
          </button>
        </form>

        {!hasQuery ? (
          <div className="mt-10">
            <p className="kicker text-muted-foreground">Browse by section</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(categories.data ?? []).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                 className="pressable rounded-sm border border-border px-3 py-1.5 text-sm hover:border-secondary-accent hover:text-secondary-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        ) : results.isLoading ? (
          <div className="mt-8">
            <StoryListSkeleton count={4} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            className="mt-10"
            title={`No stories found${submitted ? ` for “${submitted}”` : ""}`}
            description="Try a broader term, remove the date filter, or browse a section instead."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {(categories.data ?? []).slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="pressable rounded-sm border border-border px-3 py-1.5 text-sm hover:border-secondary-accent hover:text-secondary-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            }
          />
        ) : (
          <>
            <p className="mt-8 text-sm text-muted-foreground">
              {list.length} {list.length === 1 ? "story" : "stories"}
            </p>
            <div className="mt-3 divide-y divide-border border-t border-border-strong">
              {list.map((p, i) => (
                <StoryRow key={p.id} post={p} index={i} />
              ))}
            </div>
          </>
        )}
      </Container>
    </PublicLayout>
  );
}

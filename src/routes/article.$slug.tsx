import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Link2, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { BlockRenderer } from "@/components/article/BlockRenderer";
import { Newsletter } from "@/components/site/Newsletter";
import { Container, PublicLayout, SectionHeading } from "@/components/site/PublicLayout";
import { StoryRow } from "@/components/site/StoryCard";
import { EmptyState } from "@/components/ui-kit/States";
import { formatDate, formatDateTime } from "@/lib/format";
import { getPublishedArticle } from "@/lib/article.functions";
import type { Block } from "@/lib/blocks";
import {
  approvedCommentsQuery,
  db,
  mostReadQuery,
  postTagsQuery,
  publishedPostsQuery,
  registerView,
} from "@/lib/queries";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedArticle({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Story unavailable — The Dispatch" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    const title = post.seo_title ?? `${post.title} — The Dispatch`;
    const description = post.seo_description ?? post.subtitle ?? post.excerpt ?? "";
    const image = post.social_image_url ?? post.cover_url ?? undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: post.canonical_url ? [{ rel: "canonical", href: post.canonical_url }] : [],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <Container className="py-20">
        <EmptyState
          title="We couldn't find that story"
          description="The link may be out of date, or the story may have been unpublished."
          action={
            <Link
              to="/latest"
              className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Read the latest
            </Link>
          }
        />
      </Container>
    </PublicLayout>
  ),
  component: ArticlePage,
});

function useBookmark(slug: string) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const raw = window.localStorage.getItem("dispatch:bookmarks");
    setSaved(raw ? (JSON.parse(raw) as string[]).includes(slug) : false);
  }, [slug]);
  const toggle = () => {
    const raw = window.localStorage.getItem("dispatch:bookmarks");
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    window.localStorage.setItem("dispatch:bookmarks", JSON.stringify(next));
    setSaved(next.includes(slug));
    toast.success(next.includes(slug) ? "Saved to your reading list" : "Removed from your list");
  };
  return { saved, toggle };
}

function ArticlePage() {
  const { post } = Route.useLoaderData() as { post: Post };
  const blocks = (Array.isArray(post.body) ? post.body : []) as Block[];
  const { saved, toggle } = useBookmark(post.slug);

  const tags = useQuery(postTagsQuery(post.id));
  const comments = useQuery(approvedCommentsQuery(post.id));
  const mostRead = useQuery(mostReadQuery);
  const related = useQuery(
    publishedPostsQuery({ categorySlug: post.category?.slug, limit: 4, key: "related" }),
  );
  const byAuthor = useQuery(
    publishedPostsQuery({ authorSlug: post.author?.slug, limit: 4, key: "by-author" }),
  );

  useEffect(() => {
    void registerView(post.slug);
  }, [post.slug]);

  const headings = useMemo(
    () =>
      blocks
        .map((b, i) => ({ ...b, index: i }))
        .filter((b) => b.type === "heading" && b.text)
        .map((b) => ({ id: `section-${b.index}`, text: b.text as string })),
    [blocks],
  );

  const updated =
    post.updated_at && post.published_at && new Date(post.updated_at) > new Date(post.published_at)
      ? post.updated_at
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.seo_description ?? post.subtitle ?? post.excerpt ?? undefined,
    image: post.cover_url ? [post.cover_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: post.author
      ? { "@type": "Person", name: post.author.display_name }
      : undefined,
    publisher: { "@type": "Organization", name: "The Dispatch" },
    articleSection: post.category?.name,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link", { description: "You can copy it from the address bar." });
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator).share({ title: post.title, url: window.location.href });
        return;
      } catch {
        /* dismissed */
      }
    }
    void copyLink();
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-accent">
                Home
              </Link>
            </li>
            {post.category ? (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    to="/category/$slug"
                    params={{ slug: post.category.slug }}
                    className="hover:text-accent"
                  >
                    {post.category.name}
                  </Link>
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        <article className="mx-auto mt-6 max-w-[720px]">
          <header>
            <div className="flex items-center gap-3">
              {post.is_breaking ? <span className="kicker text-accent">Breaking</span> : null}
              {post.category ? (
                <Link
                  to="/category/$slug"
                  params={{ slug: post.category.slug }}
                  className="kicker text-accent hover:underline"
                >
                  {post.category.name}
                </Link>
              ) : null}
            </div>
            <h1 className="headline mt-3 text-[2.1rem] leading-[1.06] md:text-[3rem]">
              {post.title}
            </h1>
            {post.subtitle ? (
              <p className="mt-4 font-serif text-xl leading-relaxed text-muted-foreground">
                {post.subtitle}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 border-y border-border py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0 text-sm">
                {post.author ? (
                  <p>
                    By{" "}
                    <Link
                      to="/author/$slug"
                      params={{ slug: post.author.slug }}
                      className="font-semibold hover:text-accent"
                    >
                      {post.author.display_name}
                    </Link>
                    {post.author.job_title ? (
                      <span className="text-muted-foreground">, {post.author.job_title}</span>
                    ) : null}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  Published {formatDate(post.published_at)} · {post.reading_minutes} min read
                </p>
                {updated ? (
                  <p className="mt-0.5 text-xs text-accent">Updated {formatDateTime(updated)}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy link to this story"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={share}
                  aria-label="Share this story"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggle}
                  aria-pressed={saved}
                  aria-label={saved ? "Remove bookmark" : "Bookmark this story"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {saved ? (
                    <BookmarkCheck className="h-4 w-4 text-accent" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {post.cover_url ? (
            <figure className="mt-8">
              <img
                src={post.cover_url}
                alt={post.cover_caption ?? post.title}
                className="w-full"
                loading="eager"
              />
              {(post.cover_caption || post.cover_credit) && (
                <figcaption className="mt-2 flex flex-wrap gap-x-3 text-xs leading-relaxed text-muted-foreground">
                  {post.cover_caption ? <span>{post.cover_caption}</span> : null}
                  {post.cover_credit ? (
                    <span className="text-muted-foreground/80">{post.cover_credit}</span>
                  ) : null}
                </figcaption>
              )}
            </figure>
          ) : null}

          {headings.length >= 3 ? (
            <nav aria-label="In this story" className="mt-8 border border-border bg-background p-4">
              <p className="kicker text-muted-foreground">In this story</p>
              <ul className="mt-2 space-y-1.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-sm hover:text-accent">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="mt-8">
            {post.dateline ? (
              <p className="prose-article">
                <span className="kicker mr-2 text-foreground">{post.dateline} —</span>
              </p>
            ) : null}
            <BlockRenderer blocks={blocks} />
          </div>

          {(tags.data ?? []).length > 0 ? (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <span className="kicker text-muted-foreground">Topics</span>
              {(tags.data ?? []).map((t) => (
                <Link
                  key={t.id}
                  to="/tag/$slug"
                  params={{ slug: t.slug }}
                  className="rounded-sm border border-border px-2.5 py-1 text-xs hover:border-accent hover:text-accent"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          ) : null}

          {post.author ? (
            <section className="mt-10 border-t border-border pt-6">
              <p className="kicker text-muted-foreground">About the reporter</p>
              <div className="mt-3 flex gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {post.author.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <Link
                    to="/author/$slug"
                    params={{ slug: post.author.slug }}
                    className="font-semibold hover:text-accent"
                  >
                    {post.author.display_name}
                  </Link>
                  {post.author.bio ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {post.author.bio}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <CommentsSection postId={post.id} comments={comments.data ?? []} />
        </article>
      </Container>

      <Newsletter />

      <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-12">
          <section>
            <SectionHeading title="Related coverage" />
            <div className="divide-y divide-border">
              {(related.data ?? [])
                .filter((p) => p.id !== post.id)
                .slice(0, 3)
                .map((p) => (
                  <StoryRow key={p.id} post={p} />
                ))}
            </div>
          </section>
          {post.author ? (
            <section>
              <SectionHeading title={`More from ${post.author.display_name}`} />
              <div className="divide-y divide-border">
                {(byAuthor.data ?? [])
                  .filter((p) => p.id !== post.id)
                  .slice(0, 3)
                  .map((p) => (
                    <StoryRow key={p.id} post={p} />
                  ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside>
          <SectionHeading title="Most read" />
          <ol className="divide-y divide-border">
            {(mostRead.data ?? []).map((p, i) => (
              <li key={p.id} className="flex gap-3 py-4">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="headline text-[0.98rem] leading-snug">
                  <Link to="/article/$slug" params={{ slug: p.slug }} className="hover:text-accent">
                    {p.title}
                  </Link>
                </h3>
              </li>
            ))}
          </ol>
        </aside>
      </Container>
    </PublicLayout>
  );
}

function CommentsSection({
  postId,
  comments,
}: {
  postId: string;
  comments: { id: string; author_name: string; body: string; created_at: string }[];
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await db
        .from("comments")
        .insert({ post_id: postId, author_name: name.trim(), body: body.trim(), status: "pending" });
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Thanks — your comment is with our moderators.");
    },
    onError: () =>
      toast.error("We couldn't post your comment", {
        description: "Nothing was lost. Please try again in a moment.",
      }),
  });

  return (
    <section className="mt-12 border-t border-border pt-8" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="kicker text-muted-foreground">
        Comments ({comments.length})
      </h2>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && body.trim()) submit.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <label htmlFor="comment-name" className="sr-only">
              Your name
            </label>
            <input
              id="comment-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
            />
          </div>
          <div>
            <label htmlFor="comment-body" className="sr-only">
              Your comment
            </label>
            <textarea
              id="comment-body"
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add to the discussion. Comments are reviewed before they appear."
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submit.isPending}
          className="h-9 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submit.isPending ? "Posting…" : "Post comment"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No comments yet. Be the first to respond to this story.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {comments.map((c) => (
            <li key={c.id} className="py-4">
              <p className="text-sm font-semibold">{c.author_name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
              <p className="mt-2 font-serif text-[1rem] leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

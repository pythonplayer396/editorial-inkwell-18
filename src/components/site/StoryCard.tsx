import { Link } from "@tanstack/react-router";

import { timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

function Kicker({ post }: { post: Post }) {
  if (!post.category) return null;
  return (
    <Link
      to="/category/$slug"
      params={{ slug: post.category.slug }}
      className="kicker text-accent hover:underline"
    >
      {post.category.name}
    </Link>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
      {post.author ? (
        <Link
          to="/author/$slug"
          params={{ slug: post.author.slug }}
          className="font-medium text-foreground hover:text-accent"
        >
          {post.author.display_name}
        </Link>
      ) : null}
      {post.author ? <span aria-hidden>·</span> : null}
      <time dateTime={post.published_at ?? undefined}>{timeAgo(post.published_at)}</time>
    </p>
  );
}

export function LeadStory({ post }: { post: Post }) {
  return (
    <article className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:gap-10">
      {post.cover_url ? (
        <Link to="/article/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.cover_caption ?? post.title}
            className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            loading="eager"
          />
        </Link>
      ) : null}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-3">
          {post.is_breaking ? <span className="kicker text-accent">Breaking</span> : null}
          <Kicker post={post} />
        </div>
        <h2 className="headline mt-3 text-[2rem] leading-[1.05] md:text-[2.75rem]">
          <Link to="/article/$slug" params={{ slug: post.slug }} className="hover:text-accent">
            {post.title}
          </Link>
        </h2>
        {post.subtitle ? (
          <p className="mt-4 max-w-prose font-serif text-lg leading-relaxed text-muted-foreground">
            {post.subtitle}
          </p>
        ) : null}
        <Meta post={post} />
      </div>
    </article>
  );
}

export function StoryCard({
  post,
  size = "md",
  showImage = true,
  showExcerpt = false,
  className,
}: {
  post: Post;
  size?: "sm" | "md" | "lg";
  showImage?: boolean;
  showExcerpt?: boolean;
  className?: string;
}) {
  const titleSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-[0.95rem] leading-snug" : "text-lg";
  return (
    <article className={cn("group flex flex-col", className)}>
      {showImage && post.cover_url ? (
        <Link
          to="/article/$slug"
          params={{ slug: post.slug }}
          className="mb-3 block overflow-hidden"
          tabIndex={-1}
          aria-hidden
        >
          <img
            src={post.cover_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : null}
      <Kicker post={post} />
      <h3 className={cn("headline mt-1.5", titleSize)}>
        <Link to="/article/$slug" params={{ slug: post.slug }} className="hover:text-accent">
          {post.title}
        </Link>
      </h3>
      {showExcerpt && post.excerpt ? (
        <p className="mt-2 font-serif text-[0.95rem] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      ) : null}
      <Meta post={post} />
    </article>
  );
}

export function StoryRow({ post, index }: { post: Post; index?: number }) {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-5">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          {typeof index === "number" ? (
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <Kicker post={post} />
        </div>
        <h3 className="headline mt-1.5 text-[1.05rem] leading-snug">
          <Link to="/article/$slug" params={{ slug: post.slug }} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>
        <Meta post={post} />
      </div>
      {post.cover_url ? (
        <Link to="/article/$slug" params={{ slug: post.slug }} tabIndex={-1} aria-hidden>
          <img
            src={post.cover_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-16 w-24 shrink-0 object-cover sm:h-20 sm:w-32"
          />
        </Link>
      ) : null}
    </article>
  );
}

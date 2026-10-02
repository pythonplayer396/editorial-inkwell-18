import { Link } from "@tanstack/react-router";

import { timeAgoBangla } from "@/lib/format";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

function Kicker({ post }: { post: Post }) {
  if (!post.category) return null;
  return (
    <Link
      to="/category/$slug"
      params={{ slug: post.category.slug }}
      className="kicker border-l-2 border-news-brand pl-2 text-news-brand hover:underline"
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
          className="font-semibold text-foreground hover:underline"
        >
          {post.author.display_name}
        </Link>
      ) : null}
      {post.author ? <span aria-hidden>·</span> : null}
      <time dateTime={post.published_at ?? undefined}>{timeAgoBangla(post.published_at)}</time>
    </p>
  );
}

export function LeadStory({ post }: { post: Post }) {
  return (
    <article className="grid items-start gap-5 lg:grid-cols-12 lg:gap-7">
      {post.cover_url ? (
        <Link to="/article/$slug" params={{ slug: post.slug }} className="group/image image-reveal block overflow-hidden lg:col-span-7">
          <img
            src={post.cover_url}
            alt={post.cover_caption ?? post.title}
          className="aspect-video w-full object-cover transition-opacity group-hover/image:opacity-90"
            loading="eager"
          />
        </Link>
      ) : null}
      <div className="flex flex-col justify-center lg:col-span-5">
        <div className="flex items-center gap-3">
          {post.is_breaking ? <span className="kicker text-accent">ব্রেকিং</span> : null}
          <Kicker post={post} />
        </div>
         <h2 className="headline mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">
          <Link to="/article/$slug" params={{ slug: post.slug }} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        {post.subtitle ? (
           <p className="mt-5 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
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
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
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
            className="aspect-video w-full object-cover transition-opacity group-hover:opacity-90"
          />
        </Link>
      ) : null}
      <Kicker post={post} />
      <h3 className={cn("headline mt-1.5", titleSize)}>
        <Link to="/article/$slug" params={{ slug: post.slug }} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      {showExcerpt && post.excerpt ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      ) : null}
      <Meta post={post} />
    </article>
  );
}

export function StoryRow({ post, index }: { post: Post; index?: number }) {
  return (
    <article className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 py-5">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          {typeof index === "number" ? (
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <Kicker post={post} />
        </div>
        <h3 className="headline mt-1.5 text-lg">
           <Link to="/article/$slug" params={{ slug: post.slug }} className="group-hover:underline">
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
            className="h-20 w-32 shrink-0 object-cover transition-opacity group-hover:opacity-90 sm:h-24 sm:w-40"
          />
        </Link>
      ) : null}
    </article>
  );
}

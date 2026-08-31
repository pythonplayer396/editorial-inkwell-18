import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { settingsQuery } from "@/lib/queries";

export function BreakingBar() {
  const { data } = useQuery(settingsQuery);
  if (!data?.breaking_enabled || !data.breaking_text) return null;

  const content = (
    <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-5 py-2.5 sm:px-7 lg:px-10">
      <span className="kicker inline-flex shrink-0 items-center gap-2 text-accent before:h-1.5 before:w-1.5 before:animate-pulse before:rounded-full before:bg-accent before:content-['']">Breaking</span>
      <span className="h-4 w-px bg-accent/25" aria-hidden />
      <span className="min-w-0 truncate text-[0.8rem] font-medium leading-snug text-foreground">{data.breaking_text}</span>
    </div>
  );

  if (!data.breaking_href) {
    return <div className="border-b border-accent/15 bg-breaking-surface">{content}</div>;
  }

  const slug = data.breaking_href.replace("/article/", "");
  return (
    <div className="border-b border-accent/15 bg-breaking-surface transition-colors duration-300 hover:bg-accent/10">
      <Link to="/article/$slug" params={{ slug }} className="block">
        {content}
      </Link>
    </div>
  );
}

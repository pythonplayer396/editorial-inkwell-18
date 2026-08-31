import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { settingsQuery } from "@/lib/queries";

export function BreakingBar() {
  const { data } = useQuery(settingsQuery);
  if (!data?.breaking_enabled || !data.breaking_text) return null;

  const content = (
    <div className="mx-auto flex max-w-[1200px] items-baseline gap-3 px-5 py-2.5">
      <span className="kicker shrink-0 text-accent">Breaking</span>
      <span className="min-w-0 text-sm leading-snug text-foreground">{data.breaking_text}</span>
    </div>
  );

  if (!data.breaking_href) {
    return <div className="border-b border-border bg-muted/70">{content}</div>;
  }

  const slug = data.breaking_href.replace("/article/", "");
  return (
    <div className="border-b border-border bg-muted/70 transition-colors hover:bg-muted">
      <Link to="/article/$slug" params={{ slug }} className="block">
        {content}
      </Link>
    </div>
  );
}

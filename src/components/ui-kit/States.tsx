import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <p className="text-base font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something didn't load",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="border border-border bg-muted/40 px-6 py-10 text-center">
      <p className="text-base font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 rounded-sm border border-border px-4 text-sm font-medium hover:bg-background"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonLines({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse bg-muted" style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  );
}

export function StoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-border" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-5">
          <div className="min-w-0 space-y-2">
            <div className="h-3 w-20 animate-pulse bg-muted" />
            <div className="h-5 w-4/5 animate-pulse bg-muted" />
            <div className="h-3 w-32 animate-pulse bg-muted" />
          </div>
          <div className="h-16 w-24 animate-pulse bg-muted sm:h-20 sm:w-32" />
        </div>
      ))}
    </div>
  );
}

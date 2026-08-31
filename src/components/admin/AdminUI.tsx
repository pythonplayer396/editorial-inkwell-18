import type { ReactNode } from "react";

import type { PostStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border-strong pb-5">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatusPill({ status }: { status: PostStatus }) {
  const tone: Record<PostStatus, string> = {
    published: "border-success/40 text-success",
    scheduled: "border-warning/40 text-warning",
    in_review: "border-accent/40 text-accent",
    draft: "border-border text-muted-foreground",
    archived: "border-border text-muted-foreground/70",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium",
        tone[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Btn({
  children,
  variant = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
}) {
  const styles = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border bg-background hover:bg-muted",
    ghost: "hover:bg-muted",
    danger: "border border-destructive/30 text-destructive hover:bg-destructive/5",
  } as const;
  return (
    <button
      {...props}
      className={cn(
        "pressable inline-flex h-9 items-center justify-center gap-1.5 rounded-sm px-3.5 text-sm font-medium disabled:opacity-60",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
  htmlFor?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "h-9 w-full rounded-sm border border-input bg-background px-2.5 text-sm outline-none transition-all focus-visible:border-secondary-accent focus-visible:ring-2 focus-visible:ring-secondary-accent-soft";
export const textareaClass =
  "w-full rounded-sm border border-input bg-background px-2.5 py-2 text-sm outline-none transition-all focus-visible:border-secondary-accent focus-visible:ring-2 focus-visible:ring-secondary-accent-soft";

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string | undefined;
}) {
  return (
    <div className="premium-surface group p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums transition-colors group-hover:text-secondary-accent">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

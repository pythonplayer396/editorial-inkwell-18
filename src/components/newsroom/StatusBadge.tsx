import type { PostStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { statusTone } from "@/lib/workflow";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: PostStatus;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors duration-300",
        statusTone(status),
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          (status === "submitted" || status === "under_review") && "animate-pulse",
        )}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

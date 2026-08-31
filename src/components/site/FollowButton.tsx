import { Link } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";

import { useFollows } from "@/lib/reader";

export function FollowButton({
  type,
  id,
  label,
}: {
  type: "author" | "category";
  id: string;
  label: string;
}) {
  const { isFollowing, toggle, busy, signedIn } = useFollows();

  if (!signedIn) {
    return (
      <Link
        to="/auth"
        className="pressable inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-secondary-accent hover:text-secondary-accent"
      >
        <Plus className="h-3.5 w-3.5" /> Follow {label}
      </Link>
    );
  }

  const following = isFollowing(type, id);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => toggle(type, id)}
      aria-pressed={following}
      className={`pressable inline-flex h-9 items-center gap-1.5 rounded-sm border px-3 text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? "border-secondary-accent bg-secondary-accent-soft/60 text-secondary-accent"
          : "border-border text-muted-foreground hover:border-secondary-accent hover:text-secondary-accent"
      }`}
    >
      {following ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {following ? "Following" : `Follow ${label}`}
    </button>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import {
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQuery,
} from "@/lib/newsroom";

export function NotificationBell() {
  const t = useT();
  const { userId } = useCurrentUser();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery(notificationsQuery(userId));
  const items = data ?? [];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.notifications")}
        aria-expanded={open}
        className="pressable relative inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border transition-colors hover:bg-muted"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold text-accent-foreground">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="animate-in fade-in slide-in-from-top-1 premium-surface absolute right-0 z-50 mt-2 w-80 overflow-hidden duration-200">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("nav.notifications")}
            </p>
            {unread > 0 && userId ? (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                onClick={async () => {
                  await markAllNotificationsRead(userId);
                  void qc.invalidateQueries({ queryKey: ["notifications"] });
                }}
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {t("empty.notifications")}
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id} className={n.read_at ? "opacity-70" : ""}>
                  <a
                    href={n.href ?? "/admin"}
                    onClick={async () => {
                      setOpen(false);
                      if (!n.read_at) {
                        await markNotificationRead(n.id);
                        void qc.invalidateQueries({ queryKey: ["notifications"] });
                      }
                    }}
                    className="block px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body ? (
                      <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                    ) : null}
                    <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

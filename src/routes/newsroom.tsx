import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, PenLine, User } from "lucide-react";
import { useEffect } from "react";

import { LanguageSwitcher } from "@/components/newsroom/LanguageSwitcher";
import { NotificationBell } from "@/components/newsroom/NotificationBell";
import { useCurrentUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/newsroom")({
  head: () => ({
    meta: [
      { title: "Your newsroom — The Dispatch" },
      { name: "description", content: "Write stories, track submissions and read editor feedback." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JournalistShell,
});

function JournalistShell() {
  const t = useT();
  const navigate = useNavigate();
  const { session, profile, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth/journalist" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-accent" />
          Opening your newsroom…
        </div>
      </div>
    );
  }

  const NAV = [
    { to: "/newsroom", label: t("nav.dashboard"), icon: FileText, exact: true },
    { to: "/newsroom/profile", label: t("nav.profile"), icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-5 py-3">
          <Link to="/" className="min-w-0">
            <p className="truncate font-serif text-base font-semibold tracking-tight">The Dispatch</p>
            <p className="text-[0.7rem] text-muted-foreground">Journalist</p>
          </Link>
          <nav aria-label="Newsroom" className="ml-4 hidden gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: (item as { exact?: boolean }).exact ?? false }}
                className="rounded-sm px-2.5 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-sm bg-muted px-2.5 py-1.5 text-sm font-medium text-foreground shadow-[inset_0_-2px_0_0_var(--secondary-accent)]",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/newsroom/write/$id"
              params={{ id: "new" }}
              className="pressable hidden h-9 items-center gap-1.5 rounded-sm bg-primary px-3.5 text-sm font-medium text-primary-foreground sm:inline-flex"
            >
              <PenLine className="h-4 w-4" />
              {t("nav.write")}
            </Link>
            <LanguageSwitcher compact />
            <NotificationBell />
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-sm font-medium">
                {profile?.display_name ?? session.user.email}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  void navigate({ to: "/auth/journalist" });
                }}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                {t("nav.signout")}
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <Outlet />
      </div>
    </div>
  );
}

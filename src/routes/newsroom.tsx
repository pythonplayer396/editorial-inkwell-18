import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, PenLine } from "lucide-react";
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
    if (!loading && !session) void navigate({ to: "/auth" });
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
  ] as const;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-auth-line bg-editorial-dark text-editorial-dark-foreground shadow-sm">
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-5 py-3">
          <Link to="/" className="min-w-0">
            <p className="truncate font-serif text-base font-semibold tracking-tight text-editorial-dark-foreground">The Dispatch</p>
            <p className="text-[0.7rem] text-auth-muted">Journalist</p>
          </Link>
          <nav aria-label="Newsroom" className="ml-4 hidden gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: (item as { exact?: boolean }).exact ?? false }}
                className="rounded-sm px-2.5 py-1.5 text-sm text-auth-muted transition-all duration-200 hover:bg-auth-line hover:text-editorial-dark-foreground"
                activeProps={{
                  className:
                    "rounded-sm bg-auth-line px-2.5 py-1.5 text-sm font-medium text-editorial-dark-foreground shadow-[inset_0_-2px_0_0_var(--auth-teal)]",
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
               className="pressable hidden h-9 items-center gap-1.5 rounded-sm bg-accent px-3.5 text-sm font-medium text-accent-foreground sm:inline-flex"
            >
              <PenLine className="h-4 w-4" />
              {t("nav.write")}
            </Link>
            <LanguageSwitcher compact />
            <NotificationBell />
            <div className="hidden text-right sm:block">
               <p className="max-w-40 truncate text-sm font-medium text-editorial-dark-foreground">
                {profile?.display_name ?? session.user.email}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  void navigate({ to: "/auth" });
                }}
                 className="text-xs text-auth-muted underline-offset-4 hover:text-auth-teal hover:underline"
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

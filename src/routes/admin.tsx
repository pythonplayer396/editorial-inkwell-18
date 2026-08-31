import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart3, ClipboardCheck, FileText, FolderTree, Image, Inbox, LayoutDashboard, Menu, MessageSquare, ScrollText, Settings, ShieldCheck, Tags, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/newsroom/LanguageSwitcher";
import { NotificationBell } from "@/components/newsroom/NotificationBell";
import { useCurrentUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Newsroom — The Dispatch" },
      { name: "description", content: "Write, edit, schedule and publish stories." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const ALL: AppRole[] = ["owner", "editor", "author", "contributor"];
const EDITORS: AppRole[] = ["owner", "editor"];
const OWNERS: AppRole[] = ["owner"];

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, roles: ALL },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox, roles: EDITORS },
  { to: "/admin/posts", label: "Articles", icon: FileText, roles: ALL },
  { to: "/admin/media", label: "Media", icon: Image, roles: ALL },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, roles: EDITORS },
  { to: "/admin/tags", label: "Tags", icon: Tags, roles: EDITORS },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare, roles: EDITORS },
  { to: "/admin/authors", label: "Authors", icon: Users, roles: EDITORS },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: EDITORS },
  { to: "/admin/oversight", label: "Oversight", icon: ShieldCheck, roles: EDITORS },
  { to: "/admin/applications", label: "Applications", icon: UserPlus, roles: EDITORS },
  { to: "/admin/staff", label: "Staff & roles", icon: ClipboardCheck, roles: OWNERS },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText, roles: OWNERS },
  { to: "/admin/settings", label: "Settings", icon: Settings, roles: OWNERS },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const { session, profile, roles, isStaff, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth/staff" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-secondary-accent" />Loading the newsroom…</div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold tracking-tight">You don't have newsroom access</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your account is signed in but hasn't been given a newsroom role. Ask an editor to grant
            you access.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-sm border border-border px-4 text-sm font-medium"
            >
              Back to the site
            </Link>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      <aside className="border-b border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4">
          <Link to="/" className="min-w-0">
            <p className="truncate font-serif text-base font-semibold tracking-tight">
              The Dispatch
            </p>
            <p className="text-[0.7rem] text-muted-foreground">Newsroom</p>
          </Link>
          <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="pressable inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border lg:hidden"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          </div>
        </div>

        <nav
          aria-label="Newsroom"
          className={`${open ? "animate-in fade-in slide-in-from-top-2 block" : "hidden"} px-2 pb-4 duration-200 lg:block`}
        >
          <ul className="space-y-0.5">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: (item as { exact?: boolean }).exact ?? false }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-sidebar-foreground transition-all hover:translate-x-0.5 hover:bg-sidebar-accent"
                  activeProps={{
                    className:
                      "flex items-center gap-2.5 rounded-sm border-l-2 border-secondary-accent bg-sidebar-accent px-2.5 py-2 text-sm font-medium text-sidebar-accent-foreground",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )})}
          </ul>

          <div className="mt-6 border-t border-sidebar-border px-2.5 pt-4">
            <p className="truncate text-sm font-medium">
              {profile?.display_name ?? session.user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {roles.map((r) => ROLE_LABELS[r]).join(", ") || "Staff"}
            </p>
            <div className="mt-3"><LanguageSwitcher /></div>
            <div className="mt-3 flex flex-col gap-1.5">
              <Link
                to="/"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                View website
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  void navigate({ to: "/auth/staff" });
                }}
                className="text-left text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 bg-background">
        <Outlet />
      </div>
    </div>
  );
}

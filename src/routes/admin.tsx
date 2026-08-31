import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/posts", label: "Articles" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/tags", label: "Tags" },
  { to: "/admin/comments", label: "Comments" },
  { to: "/admin/authors", label: "Authors" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const { session, profile, roles, isStaff, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading the newsroom…</p>
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
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[228px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4">
          <Link to="/" className="min-w-0">
            <p className="truncate font-serif text-base font-semibold tracking-tight">
              The Dispatch
            </p>
            <p className="text-[0.7rem] text-muted-foreground">Newsroom</p>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-8 rounded-sm border border-border px-2 text-xs lg:hidden"
            aria-expanded={open}
          >
            Menu
          </button>
        </div>

        <nav
          aria-label="Newsroom"
          className={`${open ? "block" : "hidden"} px-2 pb-4 lg:block`}
        >
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: (item as { exact?: boolean }).exact ?? false }}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-2.5 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                  activeProps={{
                    className:
                      "block rounded-sm px-2.5 py-1.5 text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-sidebar-border px-2.5 pt-4">
            <p className="truncate text-sm font-medium">
              {profile?.display_name ?? session.user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {roles.map((r) => ROLE_LABELS[r]).join(", ") || "Staff"}
            </p>
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
                  void navigate({ to: "/auth" });
                }}
                className="text-left text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

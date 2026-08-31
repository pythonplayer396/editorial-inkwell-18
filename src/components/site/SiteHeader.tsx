import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function SiteHeader() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { session, isStaff } = useCurrentUser();
  const [open, setOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:py-6">
        <div className="hidden min-w-0 md:block">
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>
        <div className="md:text-center">
          <Link to="/" className="inline-block">
            <span className="headline text-2xl tracking-[-0.03em] md:text-[2rem]">
              {settings?.site_name ?? "The Dispatch"}
            </span>
          </Link>
          <p className="hidden text-[0.7rem] text-muted-foreground md:mt-1 md:block">
            {settings?.tagline}
          </p>
        </div>
        <div className="flex items-center justify-end gap-1">
          <Link
            to="/search"
            aria-label="Search stories"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <Link
              to={isStaff ? "/admin" : "/"}
              className="hidden h-9 items-center rounded-sm border border-border px-3 text-sm font-medium transition-colors hover:bg-muted md:inline-flex"
            >
              {isStaff ? "Newsroom" : "Account"}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden h-9 items-center rounded-sm border border-border px-3 text-sm font-medium transition-colors hover:bg-muted md:inline-flex"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-foreground md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav aria-label="Sections" className="hidden border-t border-border md:block">
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 overflow-x-auto px-5">
          <Link
            to="/latest"
            className="kicker py-3 text-foreground transition-colors hover:text-accent"
            activeProps={{ className: "kicker py-3 text-accent" }}
          >
            Latest
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="kicker whitespace-nowrap py-3 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "kicker whitespace-nowrap py-3 text-accent" }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {open ? (
        <nav aria-label="Sections" className="border-t border-border px-5 py-3 md:hidden">
          <ul className="divide-y divide-border">
            <li>
              <Link to="/latest" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium">
                Latest
              </Link>
            </li>
            {(categories ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={session && isStaff ? "/admin" : "/auth"}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium"
              >
                {session && isStaff ? "Newsroom" : "Sign in"}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

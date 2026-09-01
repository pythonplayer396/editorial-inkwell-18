import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function SiteHeader() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { session, isStaff, isEditor } = useCurrentUser();
  const isWriter = isStaff;
  const [open, setOpen] = useState(false);
  const t = useT();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <header className="relative z-40 border-b border-border-strong bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-7 md:py-7 lg:px-10">
        <div className="hidden min-w-0 md:block">
          <p className="text-[0.7rem] font-medium uppercase text-muted-foreground">{today}</p>
          <p className="mt-1 text-[0.65rem] text-muted-foreground/70">Independent · Since 2026</p>
        </div>
        <div className="md:text-center">
          <Link to="/" className="inline-block">
            <span className="headline text-3xl md:text-[2.75rem]">
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
            className="pressable inline-flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-secondary-accent"
          >
            <Search className="h-4 w-4" />
          </Link>
          {isWriter ? (
            <Link
              to="/newsroom/write/$id"
              params={{ id: "new" }}
              className="pressable hidden h-9 items-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
            >
              Upload
            </Link>
          ) : (
            <Link
              to="/join"
              className="pressable hidden h-9 items-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
            >
              {t("nav.join")}
            </Link>
          )}
          {session ? (
            <Link
              to={isEditor ? "/admin" : isWriter ? "/newsroom" : "/account"}
              className="pressable hidden h-9 items-center gap-1 rounded-sm border border-border px-3 text-sm font-medium hover:border-border-strong hover:bg-muted md:inline-flex"
            >
               {isWriter ? t("brand.newsroom") : t("public.account")}<ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : (

            <Link
              to="/auth"
              className="pressable hidden h-9 items-center rounded-sm border border-border px-3 text-sm font-medium hover:border-border-strong hover:bg-muted md:inline-flex"
            >
              {t("nav.signin")}
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="pressable inline-flex h-9 w-9 items-center justify-center rounded-sm text-foreground hover:bg-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav aria-label={t("public.sections")} className="hidden border-t border-border md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-7 overflow-x-auto px-7 lg:px-10">
          <Link
            to="/latest"
            className="kicker relative py-3.5 text-foreground transition-colors hover:text-secondary-accent"
            activeProps={{ className: "kicker relative py-3.5 text-secondary-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-secondary-accent" }}
          >
            {t("public.latest")}
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="kicker relative whitespace-nowrap py-3.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "kicker relative whitespace-nowrap py-3.5 text-secondary-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-secondary-accent" }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {open ? (
        <nav aria-label={t("public.sections")} className="animate-in fade-in slide-in-from-top-2 border-t border-border bg-background px-5 py-3 duration-300 md:hidden">
          <ul className="divide-y divide-border">
            <li>
              <Link to="/latest" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium">
                {t("public.latest")}
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
                to={session ? (isStaff ? "/admin" : "/account") : "/auth"}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium"
              >
                {session ? (isStaff ? t("brand.newsroom") : t("public.account")) : t("nav.signin")}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

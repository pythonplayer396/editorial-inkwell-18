import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { categoriesQuery, settingsQuery } from "@/lib/queries";
import { BrandLogo } from "@/components/site/BrandLogo";

export function SiteHeader() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: allCategories } = useQuery(categoriesQuery);
  // Legacy sections are kept in the database but parked out of the main navigation.
  const categories = (allCategories ?? []).filter((c) => (c.sort_order ?? 0) < 50);
  const { isEditor } = useCurrentUser();

  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <header className="relative z-40 bg-background">
      <div className="border-b border-news-dark/15 bg-news-dark text-primary-foreground">
        <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-between px-5 sm:px-7 lg:px-10">
          <p className="text-xs font-semibold">Independent journalism from Bangladesh</p>
          <Link to="/latest" className="hidden text-xs font-semibold hover:underline sm:block">Latest updates</Link>
        </div>
      </div>
      <div className="bg-news-brand text-primary-foreground">
        <div className="mx-auto flex min-h-20 max-w-[1280px] items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-10">
          <Link to="/" className="inline-flex bg-background px-2 py-1" aria-label={settings?.site_name ?? "The Dispatch"}>
            <BrandLogo className="w-[185px] sm:w-[245px]" />
          </Link>
          <div className="flex items-center justify-end gap-1">
          <Link
            to="/search"
            aria-label="Search stories"
            className="inline-flex h-10 w-10 items-center justify-center text-primary-foreground hover:bg-news-brand-strong"
          >
            <Search className="h-4 w-4" />
          </Link>
          {isEditor ? (
            <Link
              to="/admin"
              className="hidden h-10 items-center gap-2 border-l border-primary-foreground/30 px-4 text-sm font-bold hover:bg-news-brand-strong md:inline-flex"
            >
              <UserRound className="h-4 w-4" />{t("brand.newsroom")}
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center text-primary-foreground hover:bg-news-brand-strong md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        </div>
      </div>

      <nav aria-label={t("public.sections")} className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex max-w-[1280px] items-center overflow-x-auto px-7 lg:px-10">
          <Link
            to="/latest"
            className="relative border-r border-border px-4 py-3 text-sm font-bold text-foreground first:pl-0 hover:text-news-brand"
            activeProps={{ className: "relative border-r border-border px-4 py-3 text-sm font-bold text-news-brand first:pl-0 after:absolute after:inset-x-3 after:bottom-0 after:h-1 after:bg-news-brand" }}
          >
            {t("public.latest")}
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="relative whitespace-nowrap border-r border-border px-4 py-3 text-sm font-semibold text-foreground hover:text-news-brand"
              activeProps={{ className: "relative whitespace-nowrap border-r border-border px-4 py-3 text-sm font-bold text-news-brand after:absolute after:inset-x-3 after:bottom-0 after:h-1 after:bg-news-brand" }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {open ? (
        <nav aria-label={t("public.sections")} className="border-b border-border bg-background px-5 py-3 md:hidden">
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
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

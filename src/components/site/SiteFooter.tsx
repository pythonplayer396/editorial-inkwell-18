import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/newsroom/LanguageSwitcher";

import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  return (
    <footer className="border-t border-border-strong bg-background">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 sm:px-7 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <p className="headline text-2xl">{settings?.site_name ?? "The Dispatch"}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {settings?.tagline}
          </p>
          {settings?.contact_email ? (
            <a
              href={`mailto:${settings.contact_email}`}
                className="editorial-link mt-4 inline-block text-sm"
            >
              {settings.contact_email}
            </a>
          ) : null}
        </div>

        <nav aria-label="Sections">
          <p className="kicker text-muted-foreground">Sections</p>
          <ul className="mt-3 space-y-2">
            {(categories ?? []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                   className="editorial-link text-sm text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Publication">
          <p className="kicker text-muted-foreground">Publication</p>
          <ul className="mt-3 space-y-2">
            <li>
               <Link to="/about" className="editorial-link text-sm">
                About
              </Link>
            </li>
            <li>
               <Link to="/contact" className="editorial-link text-sm">
                Contact
              </Link>
            </li>
            <li>
               <Link to="/latest" className="editorial-link text-sm">
                Latest stories
              </Link>
            </li>
            <li>
               <Link to="/search" className="editorial-link text-sm">
                Search
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Elsewhere">
          <p className="kicker text-muted-foreground">Elsewhere</p>
          <ul className="mt-3 space-y-2">
            {settings?.twitter ? (
              <li>
                <a
                  href={`https://x.com/${settings.twitter}`}
                   className="editorial-link text-sm"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  X / Twitter
                </a>
              </li>
            ) : null}
            {settings?.linkedin ? (
              <li>
                <a
                  href={settings.linkedin}
                   className="editorial-link text-sm"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <p>
            © {new Date().getUTCFullYear()} {settings?.site_name ?? "The Dispatch"}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <p>Published independently.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

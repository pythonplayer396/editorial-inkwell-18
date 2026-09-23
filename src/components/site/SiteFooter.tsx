import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/newsroom/LanguageSwitcher";
import { BrandLogo } from "@/components/site/BrandLogo";

import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  return (
    <footer className="border-t-4 border-news-brand bg-news-dark text-primary-foreground">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-10 sm:px-7 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link to="/" aria-label={settings?.site_name ?? "The Dispatch"} className="inline-block rounded-sm bg-paper px-3 py-2">
            <BrandLogo className="w-52" />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            {settings?.tagline}
          </p>
          {settings?.contact_email ? (
            <a
              href={`mailto:${settings.contact_email}`}
                className="mt-4 inline-block text-sm font-semibold text-primary-foreground hover:underline"
            >
              {settings.contact_email}
            </a>
          ) : null}
        </div>

        <nav aria-label="Sections">
          <p className="text-sm font-bold">Sections</p>
          <ul className="mt-3 space-y-2">
            {(categories ?? []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                    className="text-sm text-primary-foreground/75 hover:text-primary-foreground hover:underline"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Publication">
          <p className="text-sm font-bold">Publication</p>
          <ul className="mt-3 space-y-2">
            <li>
               <Link to="/about" className="text-sm text-primary-foreground/75 hover:underline">
                About
              </Link>
            </li>
            <li>
               <Link to="/contact" className="text-sm text-primary-foreground/75 hover:underline">
                Contact
              </Link>
            </li>
            <li>
               <Link to="/latest" className="text-sm text-primary-foreground/75 hover:underline">
                Latest stories
              </Link>
            </li>
            <li>
               <Link to="/search" className="text-sm text-primary-foreground/75 hover:underline">
                Search
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Elsewhere">
          <p className="text-sm font-bold">Elsewhere</p>
          <ul className="mt-3 space-y-2">
            {settings?.twitter ? (
              <li>
                <a
                  href={`https://x.com/${settings.twitter}`}
                    className="text-sm text-primary-foreground/75 hover:underline"
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
                    className="text-sm text-primary-foreground/75 hover:underline"
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

      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 text-xs text-primary-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
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

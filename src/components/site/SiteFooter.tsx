import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { categoriesQuery, settingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  return (
    <footer className="mt-20 border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="headline text-xl">{settings?.site_name ?? "The Dispatch"}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {settings?.tagline}
          </p>
          {settings?.contact_email ? (
            <a
              href={`mailto:${settings.contact_email}`}
              className="mt-4 inline-block text-sm underline decoration-border underline-offset-4 hover:decoration-accent"
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
                  className="text-sm text-foreground hover:text-accent"
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
              <Link to="/about" className="text-sm hover:text-accent">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm hover:text-accent">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/latest" className="text-sm hover:text-accent">
                Latest stories
              </Link>
            </li>
            <li>
              <Link to="/search" className="text-sm hover:text-accent">
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
                  className="text-sm hover:text-accent"
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
                  className="text-sm hover:text-accent"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </li>
            ) : null}
            <li>
              <Link to="/auth" className="text-sm hover:text-accent">
                Staff sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getUTCFullYear()} {settings?.site_name ?? "The Dispatch"}. All rights
            reserved.
          </p>
          <p>Published independently.</p>
        </div>
      </div>
    </footer>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Container, PublicLayout, SectionHeading } from "@/components/site/PublicLayout";
import { authorsQuery, settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About The Dispatch" },
      {
        name: "description",
        content:
          "Who we are, how we report, and the standards that govern the work published by The Dispatch.",
      },
      { property: "og:title", content: "About The Dispatch" },
      {
        property: "og:description",
        content: "Who we are, how we report, and the standards that govern our journalism.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const settings = useQuery(settingsQuery);
  const authors = useQuery(authorsQuery);

  return (
    <PublicLayout>
      <Container className="py-12">
        <div className="max-w-[720px]">
          <p className="kicker text-accent">About</p>
          <h1 className="headline mt-2 text-4xl md:text-5xl">
            {settings.data?.site_name ?? "The Dispatch"}
          </h1>
          <div className="prose-article mt-6">
            <p>
              {settings.data?.about_text ??
                "The Dispatch is an independent publication covering government, business, technology and civic life. We publish original reporting, verified before it goes out, and we correct the record in public when we get something wrong."}
            </p>
            <p>
              Our work is funded by readers. We do not run sponsored articles, and no advertiser sees
              a story before publication.
            </p>
            <h2 className="headline mt-10 mb-3 text-2xl">How we report</h2>
            <p>
              Every story names its sources where it can, and explains why it cannot where it can't.
              Documents are published alongside reporting whenever release does not put a person at
              risk.
            </p>
            <h2 className="headline mt-10 mb-3 text-2xl">Corrections</h2>
            <p>
              Corrections are appended to the story and dated. Substantive changes after publication
              are marked with an update notice at the top of the article.
            </p>
          </div>
        </div>

        <section className="mt-16">
          <SectionHeading title="The newsroom" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(authors.data ?? []).map((a) => (
              <article key={a.id} className="flex gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                  {a.avatar_url ? (
                    <img src={a.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-serif text-lg text-muted-foreground">
                      {a.display_name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    to="/author/$slug"
                    params={{ slug: a.slug }}
                    className="font-semibold hover:text-accent"
                  >
                    {a.display_name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{a.job_title ?? "Contributor"}</p>
                  {a.bio ? (
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {a.bio}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </PublicLayout>
  );
}

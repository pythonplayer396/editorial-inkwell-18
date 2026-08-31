import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Container, PublicLayout } from "@/components/site/PublicLayout";
import { StoryRow } from "@/components/site/StoryCard";
import { EmptyState } from "@/components/ui-kit/States";
import { useAuth } from "@/hooks/useAuth";
import { LOCALES, useI18n } from "@/lib/i18n";
import { authorsQuery, categoriesQuery } from "@/lib/queries";
import { useBookmarks, useFollows, usePreferences } from "@/lib/reader";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — The Dispatch" },
      {
        name: "description",
        content:
          "Your saved stories, the journalists and sections you follow, and your notification preferences on The Dispatch.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Your account — The Dispatch" },
      {
        property: "og:description",
        content: "Saved stories, follows and notification preferences.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

const TABS = [
  { id: "saved", label: "Saved stories" },
  { id: "following", label: "Following" },
  { id: "preferences", label: "Preferences" },
] as const;

function AccountPage() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("saved");

  if (loading) {
    return (
      <PublicLayout>
        <Container className="py-20">
          <div className="h-24 animate-pulse rounded-sm bg-muted" />
        </Container>
      </PublicLayout>
    );
  }

  if (!session) {
    return (
      <PublicLayout>
        <Container className="py-20">
          <EmptyState
            title="Sign in to use your reader account"
            description="A reader account keeps your saved stories, follows and notification preferences in one place."
            action={
              <Link
                to="/auth"
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Sign in
              </Link>
            }
          />
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Container className="py-12 md:py-16">
        <header className="editorial-enter border-b border-border-strong pb-6">
          <p className="kicker text-secondary-accent">Reader account</p>
          <h1 className="headline mt-2 text-4xl md:text-5xl">Your Dispatch</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {session.user.email} — saved reporting, the people you follow, and how we reach you.
          </p>
        </header>

        <nav className="mt-6 flex flex-wrap gap-1 border-b border-border" aria-label="Account sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`pressable -mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-secondary-accent text-secondary-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "saved" ? <SavedTab /> : null}
          {tab === "following" ? <FollowingTab /> : null}
          {tab === "preferences" ? <PreferencesTab /> : null}
        </div>
      </Container>
    </PublicLayout>
  );
}

function SavedTab() {
  const { bookmarks, loading, toggle, busy } = useBookmarks();

  if (loading) return <div className="h-24 animate-pulse rounded-sm bg-muted" />;
  if (!bookmarks.length)
    return (
      <EmptyState
        title="No saved stories yet"
        description="Tap the bookmark icon on any story to keep it here for later."
        action={
          <Link
            to="/latest"
            className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Browse the latest
          </Link>
        }
      />
    );

  return (
    <ul className="divide-y divide-border">
      {bookmarks.map((b) =>
        b.post ? (
          <li key={b.id} className="editorial-enter flex items-start gap-4 py-5">
            <div className="min-w-0 flex-1">
              <StoryRow post={b.post as Post} />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle(b.post_id)}
              className="pressable shrink-0 rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
            >
              Remove
            </button>
          </li>
        ) : null,
      )}
    </ul>
  );
}

function FollowingTab() {
  const { follows, loading, toggle, busy } = useFollows();
  const authors = useQuery(authorsQuery);
  const categories = useQuery(categoriesQuery);

  if (loading) return <div className="h-24 animate-pulse rounded-sm bg-muted" />;

  const authorFollows = follows.filter((f) => f.target_type === "author");
  const categoryFollows = follows.filter((f) => f.target_type === "category");

  if (!follows.length)
    return (
      <EmptyState
        title="You're not following anyone yet"
        description="Follow journalists and sections to shape what we highlight for you."
        action={
          <Link
            to="/latest"
            className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Find reporting to follow
          </Link>
        }
      />
    );

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section>
        <h2 className="kicker text-muted-foreground">Journalists</h2>
        <ul className="mt-3 divide-y divide-border">
          {authorFollows.map((f) => {
            const author = (authors.data ?? []).find((a) => a.id === f.target_id);
            return (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                {author ? (
                  <Link
                    to="/author/$slug"
                    params={{ slug: author.slug }}
                    className="editorial-link text-sm font-medium"
                  >
                    {author.display_name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Journalist</span>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggle("author", f.target_id)}
                  className="pressable rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-60"
                >
                  Unfollow
                </button>
              </li>
            );
          })}
          {!authorFollows.length ? (
            <li className="py-3 text-sm text-muted-foreground">No journalists followed yet.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <h2 className="kicker text-muted-foreground">Sections</h2>
        <ul className="mt-3 divide-y divide-border">
          {categoryFollows.map((f) => {
            const category = (categories.data ?? []).find((c) => c.id === f.target_id);
            return (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                {category ? (
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    className="editorial-link text-sm font-medium"
                  >
                    {category.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Section</span>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggle("category", f.target_id)}
                  className="pressable rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-60"
                >
                  Unfollow
                </button>
              </li>
            );
          })}
          {!categoryFollows.length ? (
            <li className="py-3 text-sm text-muted-foreground">No sections followed yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function PreferencesTab() {
  const { prefs, loading, save, saving } = usePreferences();
  const { locale, setLocale } = useI18n();

  if (loading) return <div className="h-24 animate-pulse rounded-sm bg-muted" />;

  const value = {
    email_digest: prefs?.email_digest ?? true,
    notify_new_stories: prefs?.notify_new_stories ?? true,
    notify_replies: prefs?.notify_replies ?? true,
    locale: prefs?.locale ?? locale,
  };

  const rows = [
    {
      key: "email_digest" as const,
      title: "Weekly digest",
      description: "A short email with the reporting we think you shouldn't miss.",
    },
    {
      key: "notify_new_stories" as const,
      title: "New stories from your follows",
      description: "Alerts when a journalist or section you follow publishes.",
    },
    {
      key: "notify_replies" as const,
      title: "Replies to your comments",
      description: "Tell me when someone responds in a thread I joined.",
    },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <section className="premium-surface divide-y divide-border rounded-sm border border-border">
        {rows.map((row) => (
          <label
            key={row.key}
            className="flex cursor-pointer items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
          >
            <span>
              <span className="block text-sm font-medium">{row.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{row.description}</span>
            </span>
            <input
              type="checkbox"
              checked={value[row.key]}
              disabled={saving}
              onChange={(e) => save({ ...value, [row.key]: e.target.checked })}
              className="mt-1 h-4 w-4 accent-[var(--secondary-accent)]"
            />
          </label>
        ))}
      </section>

      <section>
        <h2 className="kicker text-muted-foreground">Reading language</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sets the interface language across The Dispatch.
        </p>
        <select
          value={value.locale}
          disabled={saving}
          onChange={(e) => {
            setLocale(e.target.value as typeof locale);
            save({ ...value, locale: e.target.value });
          }}
          className="mt-3 h-9 w-full max-w-xs rounded-sm border border-border bg-background px-2 text-sm"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native} — {l.label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}

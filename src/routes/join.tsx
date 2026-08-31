import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PublicLayout } from "@/components/site/PublicLayout";
import { useCurrentUser } from "@/hooks/useAuth";
import { db } from "@/lib/queries";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join The Dispatch — write for the publication" },
      {
        name: "description",
        content:
          "Apply to report for The Dispatch. How writing, submission, editorial review and publication work at the publication.",
      },
      { property: "og:title", content: "Join The Dispatch" },
      {
        property: "og:description",
        content: "Apply to report for The Dispatch and see how editorial review works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

const STEPS = [
  { title: "Join", body: "Send an application telling us what you cover and where you've written." },
  { title: "Write", body: "Once approved, draft your story in the newsroom — headline, photos, sources." },
  { title: "Submit", body: "Send it to the editorial desk when you're ready. Nothing publishes on its own." },
  { title: "Editorial review", body: "An editor reads it in full and checks sourcing, accuracy and framing." },
  { title: "Changes or approval", body: "You'll either get specific feedback to revise, or an approval." },
  { title: "Publish", body: "The desk publishes or schedules the approved story under your byline." },
];

const FAQ = [
  {
    q: "Who can become a journalist here?",
    a: "Reporters, specialists and subject-matter writers. Experience helps, but a clear application and a sample of your thinking matter more.",
  },
  {
    q: "What can I publish?",
    a: "Any legitimate reporting or analysis, in any section, as long as it is accurate, sourced and written for a general reader.",
  },
  {
    q: "Why can't I publish directly?",
    a: "Every story is read by an editor first. That review is what makes a byline here mean something.",
  },
  {
    q: "What if changes are requested?",
    a: "You'll see the editor's note on your story, revise it, and resubmit. The review history stays attached.",
  },
  {
    q: "What if a story is rejected?",
    a: "You get a stated reason. The story stays in your history and you can rework it or move on.",
  },
];

function JoinPage() {
  const { userId, profile } = useCurrentUser();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    experience: "",
    coverage_areas: "",
    previous_publications: "",
    portfolio_links: "",
    motivation: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await db.from("journalist_applications").insert({
        user_id: userId ?? null,
        full_name: form.full_name || profile?.display_name || "",
        email: form.email || profile?.email || "",
        bio: form.bio,
        experience: form.experience,
        coverage_areas: form.coverage_areas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        previous_publications: form.previous_publications,
        portfolio_links: form.portfolio_links,
        motivation: form.motivation,
      });
      if (error) throw new Error((error as { message: string }).message);
      setSent(true);
      toast.success("Application received", {
        description: "The editorial desk will be in touch.",
      });
    } catch {
      toast.error("We couldn't send your application", {
        description: "Please check the form and try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const input =
    "h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none transition-all duration-200 focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--ring)_18%,transparent)]";
  const area =
    "min-h-24 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-all duration-200 focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--ring)_18%,transparent)]";

  return (
    <PublicLayout>
      <section className="editorial-enter border-b border-border pb-10">
        <p className="kicker">For writers</p>
        <h1 className="headline mt-3 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
          Join The Dispatch
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The Dispatch is an independent publication covering politics, business, technology and
          culture. We publish careful reporting under real bylines, read by an editor before it
          reaches a reader. This is what it looks like to write here.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="headline text-2xl">How it works</h2>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="editorial-enter bg-background p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-accent">
                Step {i + 1}
              </p>
              <p className="mt-2 font-serif text-lg">{s.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <h2 className="headline text-2xl">Questions, answered</h2>
          <dl className="mt-5 divide-y divide-border border-y border-border">
            {FAQ.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="text-sm font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-muted-foreground">
            Already writing for us?{" "}
            <Link to="/auth/journalist" className="story-link font-medium text-foreground underline underline-offset-4">
              Sign in to the newsroom
            </Link>
            .
          </p>
        </div>

        <aside className="premium-surface h-fit p-5">
          {sent ? (
            <div className="editorial-enter py-6 text-center">
              <p className="font-serif text-xl">Application received</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                An editor will review it and get back to you. If we need more information, we'll ask.
              </p>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={submit}>
              <div>
                <h2 className="font-serif text-xl">Apply to write</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us what you cover. Everything here is read by an editor.
                </p>
              </div>
              <label className="block text-xs font-medium">
                Full name
                <input required className={`${input} mt-1.5`} value={form.full_name} onChange={set("full_name")} />
              </label>
              <label className="block text-xs font-medium">
                Short bio
                <textarea required className={`${area} mt-1.5`} value={form.bio} onChange={set("bio")} />
              </label>
              <label className="block text-xs font-medium">
                Experience
                <textarea className={`${area} mt-1.5`} value={form.experience} onChange={set("experience")} />
              </label>
              <label className="block text-xs font-medium">
                Areas of coverage
                <input
                  placeholder="Technology, Local politics"
                  className={`${input} mt-1.5`}
                  value={form.coverage_areas}
                  onChange={set("coverage_areas")}
                />
                <span className="mt-1 block font-normal text-muted-foreground">Separate with commas.</span>
              </label>
              <label className="block text-xs font-medium">
                Previous publications
                <input className={`${input} mt-1.5`} value={form.previous_publications} onChange={set("previous_publications")} />
              </label>
              <label className="block text-xs font-medium">
                Portfolio links
                <textarea className={`${area} mt-1.5`} value={form.portfolio_links} onChange={set("portfolio_links")} />
              </label>
              <label className="block text-xs font-medium">
                Why do you want to join?
                <textarea required className={`${area} mt-1.5`} value={form.motivation} onChange={set("motivation")} />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="h-10 w-full rounded-sm bg-primary text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send application"}
              </button>
              <p className="text-xs text-muted-foreground">
                Applications move through Pending → Under review → Approved, rejected, or more
                information required.
              </p>
            </form>
          )}
        </aside>
      </section>
    </PublicLayout>
  );
}

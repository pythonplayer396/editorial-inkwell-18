import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PublicLayout } from "@/components/site/PublicLayout";
import { useCurrentUser } from "@/hooks/useAuth";
import { db } from "@/lib/queries";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Write for The Dispatch — apply to join" },
      {
        name: "description",
        content:
          "Apply to report for The Dispatch. Six clear steps from application to published byline, plus answers to the questions writers ask most.",
      },
      { property: "og:title", content: "Write for The Dispatch" },
      {
        property: "og:description",
        content: "Apply to report for The Dispatch and see exactly how editorial review works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

const STEPS = [
  {
    title: "Send your application",
    body: "Two minutes. Tell us what you cover, where you've written, and why you want to write here.",
  },
  {
    title: "We read it",
    body: "An editor reviews every application by hand. You'll hear back either way — approved, declined, or a request for more.",
  },
  {
    title: "Your newsroom opens",
    body: "Once approved you get your own writing panel: draft stories, add photos, save as you go.",
  },
  {
    title: "Send it to the desk",
    body: "When a story is ready, submit it. Nothing goes live on its own — that's the point.",
  },
  {
    title: "Feedback or approval",
    body: "An editor either approves it, or leaves specific notes for you to revise and resubmit.",
  },
  {
    title: "Published",
    body: "The desk publishes or schedules the story under your byline, with your profile attached.",
  },
];

const FAQ = [
  {
    q: "Who can write here?",
    a: "Reporters, specialists and subject-matter writers. Experience helps, but a clear application and a sample of your thinking matter more.",
  },
  {
    q: "What can I publish?",
    a: "Reporting or analysis in any section, as long as it is accurate, sourced, and written for a general reader.",
  },
  {
    q: "Why can't I publish directly?",
    a: "Every story is read by an editor first. That review is what makes a byline here mean something.",
  },
  {
    q: "What if changes are requested?",
    a: "You'll see the editor's note on your story. Revise it and resubmit — the review history stays attached.",
  },
  {
    q: "What if a story is declined?",
    a: "You get a stated reason. The story stays in your history; you can rework it or move on.",
  },
  {
    q: "How long does approval take?",
    a: "Usually a few days. If we need more information, we'll ask before deciding.",
  },
];

function JoinPage() {
  const { userId, profile, roles } = useCurrentUser();
  const isAuthor = roles.includes("author") || roles.includes("editor") || roles.includes("owner");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    bio: "",
    experience: "",
    coverage_areas: "",
    previous_publications: "",
    portfolio_links: "",
    motivation: "",
  });

  const myApplication = useQuery({
    queryKey: ["me", "application", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await db
        .from("journalist_applications")
        .select("id,status,created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(1);
      return ((data ?? [])[0] as { id: string; status: string } | undefined) ?? null;
    },
  });

  const pending = !isAuthor && ["pending", "under_review", "more_info"].includes(
    myApplication.data?.status ?? "",
  );

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
    } catch (err) {
      toast.error("We couldn't send your application", {
        description: (err as Error).message || "Please check the form and try again.",
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
          {isAuthor ? "You write for The Dispatch" : "Write for The Dispatch"}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {isAuthor
            ? "Your byline is approved. Your writing panel is where you draft stories, add photos and send work to the editorial desk."
            : "The Dispatch is an independent publication covering politics, business, technology and culture. We publish careful reporting under real bylines, read by an editor before it reaches a reader. Here is exactly how it works."}
        </p>
        {isAuthor ? (
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/newsroom/write/$id"
              params={{ id: "new" }}
              className="pressable inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              <PenLine className="h-4 w-4" />
              Upload a story
            </Link>
            <Link
              to="/newsroom"
              className="inline-flex h-11 items-center gap-2 rounded-sm border border-border px-5 text-sm font-medium"
            >
              Go to your newsroom
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </section>

      {isAuthor ? null : (
        <section className="mt-12">
          <h2 className="headline text-2xl">How it works</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Six steps, start to finish. You never have to guess where your story stands.
          </p>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="editorial-enter bg-background p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-secondary-accent/40 text-xs font-semibold text-secondary-accent">
                  {i + 1}
                </span>
                <p className="mt-3 font-serif text-lg leading-snug">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

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
          {isAuthor ? (
            <div className="editorial-enter py-6 text-center">
              <CheckCircle2 className="mx-auto h-7 w-7 text-secondary-accent" />
              <p className="mt-3 font-serif text-xl">You're approved</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No application needed. Head to your writing panel to start a story.
              </p>
              <Link
                to="/newsroom/write/$id"
                params={{ id: "new" }}
                className="pressable mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                <PenLine className="h-4 w-4" />
                Upload a story
              </Link>
            </div>
          ) : pending || sent ? (
            <div className="editorial-enter py-6 text-center">
              <Clock className="mx-auto h-7 w-7 text-secondary-accent" />
              <p className="mt-3 font-serif text-xl">Application with the desk</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                An editor is reviewing it. As soon as it's approved, this page turns into your upload
                shortcut — and your newsroom opens.
              </p>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={submit}>
              <div>
                <h2 className="font-serif text-xl">Apply to write</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Takes about two minutes. Everything here is read by an editor.
                </p>
              </div>
              <label className="block text-xs font-medium">
                Full name
                <input required className={`${input} mt-1.5`} value={form.full_name} onChange={set("full_name")} />
              </label>
              <label className="block text-xs font-medium">
                Email
                <input
                  required
                  type="email"
                  className={`${input} mt-1.5`}
                  value={form.email}
                  onChange={set("email")}
                />
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
                Your application moves through: pending → under review → approved, declined, or more
                information needed.
              </p>
            </form>
          )}
        </aside>
      </section>
    </PublicLayout>
  );
}

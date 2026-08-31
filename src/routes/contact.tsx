import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Container, PublicLayout } from "@/components/site/PublicLayout";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact The Dispatch" },
      {
        name: "description",
        content: "Send a tip, request a correction, or reach the editors of The Dispatch.",
      },
      { property: "og:title", content: "Contact The Dispatch" },
      {
        property: "og:description",
        content: "Send a tip, request a correction, or reach the editors.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const settings = useQuery(settingsQuery);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "tip", message: "" });
  const email = settings.data?.contact_email ?? "newsroom@thedispatch.press";

  return (
    <PublicLayout>
      <Container className="py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="max-w-[640px]">
            <p className="kicker text-accent">Contact</p>
            <h1 className="headline mt-2 text-4xl">Get in touch</h1>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-muted-foreground">
              Tips, documents and corrections all reach the same desk. If a story is sensitive, say
              so — we will find a safer channel before you send anything.
            </p>

            {sent ? (
              <div className="mt-8 border border-border bg-muted/50 p-6">
                <p className="font-semibold">Message ready to send</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Your email client should have opened with the message drafted. If it didn't, write
                  to{" "}
                  <a href={`mailto:${email}`} className="underline underline-offset-4">
                    {email}
                  </a>{" "}
                  directly — nothing you typed was lost.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 h-9 rounded-sm border border-border px-4 text-sm font-medium hover:bg-background"
                >
                  Write another message
                </button>
              </div>
            ) : (
              <form
                className="mt-8 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const subject = encodeURIComponent(`[${form.subject}] from ${form.name}`);
                  const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
                  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                  setSent(true);
                  toast.success("Opening your email client…");
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="c-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-subject" className="mb-1.5 block text-sm font-medium">
                    Reason
                  </label>
                  <select
                    id="c-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="h-10 w-full rounded-sm border border-input bg-background px-2 text-sm"
                  >
                    <option value="tip">News tip</option>
                    <option value="correction">Correction request</option>
                    <option value="editorial">Editorial enquiry</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="c-message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Send message
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-6 border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <p className="kicker text-muted-foreground">Newsroom</p>
              <a
                href={`mailto:${email}`}
                className="mt-2 block text-sm underline decoration-border underline-offset-4 hover:decoration-accent"
              >
                {email}
              </a>
            </div>
            <div>
              <p className="kicker text-muted-foreground">Corrections</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We publish corrections on the story itself, dated and described. Tell us what is
                wrong and where.
              </p>
            </div>
            <div>
              <p className="kicker text-muted-foreground">Sensitive material</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Do not send confidential documents by ordinary email. Contact us first and we will
                arrange a secure route.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </PublicLayout>
  );
}

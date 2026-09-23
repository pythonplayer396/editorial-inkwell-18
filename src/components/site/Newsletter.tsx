import { useT } from "@/lib/i18n";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { db } from "@/lib/queries";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const t = useT();

  const subscribe = useMutation({
    mutationFn: async (value: string) => {
      const { error } = await db.from("subscribers").insert({ email: value });
      if (error && !String((error as { message?: string }).message).includes("duplicate")) {
        throw new Error((error as { message: string }).message);
      }
    },
    onSuccess: () => {
      setEmail("");
      toast.success("You're on the list.", {
        description: "The morning briefing arrives at 7am, weekdays.",
      });
    },
    onError: () =>
      toast.error("We couldn't sign you up", {
        description: "Please check the address and try again — nothing was lost.",
      }),
  });

  return (
    <section
      className={
        compact
          ? "border-y border-border py-8"
          : "border-y border-border bg-news-surface px-5 py-10 text-foreground"
      }
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-7 border-l-4 border-news-brand pl-5 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div>
          <p className="kicker text-news-brand">News briefing</p>
          <h2 id="newsletter-heading" className="headline mt-2 text-2xl sm:text-3xl">
            The morning briefing
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            What happened, what it means, and what to watch — one email, weekday mornings.
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) subscribe.mutate(email.trim());
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("public.emailPlaceholder")}
            className="h-11 min-w-0 flex-1 border border-border-strong bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-news-brand"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="h-11 shrink-0 bg-news-brand px-6 text-sm font-bold text-primary-foreground hover:bg-news-brand-strong disabled:opacity-60"
          >
            {subscribe.isPending ? "Signing up…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

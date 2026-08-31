import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { db } from "@/lib/queries";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");

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
          : "relative overflow-hidden border-y border-border-strong bg-ink px-5 py-14 text-primary-foreground sm:py-16"
      }
      aria-labelledby="newsletter-heading"
    >
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <p className="kicker text-accent-soft">Weekday intelligence</p>
          <h2 id="newsletter-heading" className="headline mt-3 text-3xl sm:text-4xl">
            The morning briefing
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/65">
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
            placeholder="you@example.com"
            className="h-12 min-w-0 flex-1 rounded-sm border border-primary-foreground/20 bg-primary-foreground/7 px-4 text-sm text-primary-foreground outline-none transition-all duration-300 placeholder:text-primary-foreground/40 focus-visible:border-secondary-accent focus-visible:bg-primary-foreground/10"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="h-12 shrink-0 rounded-sm bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/90 active:translate-y-0 disabled:opacity-60"
          >
            {subscribe.isPending ? "Signing up…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

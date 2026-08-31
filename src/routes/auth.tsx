import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — The Dispatch newsroom" },
      {
        name: "description",
        content: "Sign in to the newsroom to write, edit and publish stories for The Dispatch.",
      },
      { property: "og:title", content: "Sign in — The Dispatch newsroom" },
      { property: "og:description", content: "Newsroom access for Dispatch staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/admin" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You can sign in now." });
        setMode("signin");
      }
    } catch (err) {
      toast.error(
        mode === "signin" ? "We couldn't sign you in" : "We couldn't create that account",
        { description: (err as Error).message },
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in didn't complete", { description: "Please try again." });
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/admin" });
  };

  const marquee = [
    "Council votes 7–2 on transit plan",
    "Markets steady after quiet session",
    "Inside the newsroom's late edition",
    "Profile: the archivist of Ward 4",
    "Weather holds through the weekend",
    "Editors' picks, updated hourly",
  ];

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,1fr)_480px]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-background p-12 lg:flex">
        {/* Slow scrolling headline ticker behind the copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        >
          <div className="auth-ticker space-y-6 p-10">
            {[...marquee, ...marquee, ...marquee, ...marquee].map((h, i) => (
              <p key={i} className="headline whitespace-nowrap text-4xl">
                {h}
              </p>
            ))}
          </div>
        </div>

        <div className="relative auth-rise">
          <p className="headline text-2xl">The Dispatch</p>
          <p className="mt-1 text-xs text-muted-foreground">Newsroom</p>
        </div>
        <div className="relative max-w-md auth-rise" style={{ animationDelay: "120ms" }}>
          <p className="headline text-3xl leading-tight">
            Write, edit and publish — without touching anything technical.
            <span className="auth-cursor" aria-hidden />
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Draft in blocks, add photographs with credits, schedule for the morning, and see how the
            story performs once it's out.
          </p>
        </div>
        <p className="relative text-xs text-muted-foreground auth-rise" style={{ animationDelay: "240ms" }}>
          Staff access only.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="auth-rise">
            <h1 className="text-xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in to the newsroom" : "Create your newsroom account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Use the account your editor set up for you."
                : "The first account created becomes the publication owner."}
            </p>
          </div>

          <button
            type="button"
            onClick={google}
            className="auth-rise mt-6 h-10 w-full rounded-sm border border-border bg-background text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm active:translate-y-0"
            style={{ animationDelay: "80ms" }}
          >
            Continue with Google
          </button>

          <div
            className="auth-rise my-5 flex items-center gap-3 text-xs text-muted-foreground"
            style={{ animationDelay: "140ms" }}
          >
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>


          <form className="space-y-3" onSubmit={submit}>
            {mode === "signup" ? (
              <div>
                <label htmlFor="a-name" className="mb-1.5 block text-sm font-medium">
                  Full name
                </label>
                <input
                  id="a-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="a-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="a-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div>
              <label htmlFor="a-password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                id="a-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-10 w-full rounded-sm bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

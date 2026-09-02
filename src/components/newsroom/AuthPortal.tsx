import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export interface PortalCopy {
  eyebrow: string;
  heading: string;
  blurb: string;
  formTitle: string;
  formHint: string;
  /** Where a successful sign-in lands. */
  redirect: string;
  allowSignUp?: boolean;
  footnote?: string;
}

const MARQUEE = [
  "Council votes 7–2 on transit plan",
  "Markets steady after quiet session",
  "Inside the newsroom's late edition",
  "Profile: the archivist of Ward 4",
  "Weather holds through the weekend",
  "Editors' picks, updated hourly",
];

export function AuthPortal({ copy }: { copy: PortalCopy }) {
  const navigate = useNavigate();
  const { session, roles, isEditor, loading } = useCurrentUser();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Managed Google sign-in relies on the /~oauth broker, which only exists on
  // Lovable-hosted origins. On other hosts (e.g. Vercel) hide the button.
  const [googleAvailable, setGoogleAvailable] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setGoogleAvailable(host === "localhost" || host.endsWith(".lovable.app"));
  }, []);

  // One sign-in page for everyone: after the session resolves, send people to
  // the surface their role actually grants.
  useEffect(() => {
    if (!session || loading) return;
    const destination = isEditor ? "/admin" : roles.includes("author") ? "/newsroom" : copy.redirect;
    void navigate({ to: destination });
  }, [session, loading, isEditor, roles, navigate, copy.redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: copy.redirect });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created", { description: "You're signed in." });
          return;
        }
        setConfirmationEmail(email);
        setPassword("");
        toast.success("Check your email", {
          description: "Confirm your email address before signing in.",
        });
      }
    } catch (err) {
      toast.error(mode === "signin" ? "We couldn't sign you in" : "We couldn't create that account", {
        description: (err as Error).message,
      });
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
    void navigate({ to: copy.redirect });
  };

  const inputCls =
    "h-10 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none transition-all duration-200 focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--ring)_18%,transparent)]";

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,1fr)_480px]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-background p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        >
          <div className="auth-ticker space-y-6 p-10">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((h, i) => (
              <p key={i} className="headline whitespace-nowrap text-4xl">
                {h}
              </p>
            ))}
          </div>
        </div>

        <div className="auth-rise relative">
          <Link to="/" className="headline text-2xl">
            The Dispatch
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {copy.eyebrow}
          </p>
        </div>
        <div className="auth-rise relative max-w-md" style={{ animationDelay: "120ms" }}>
          <p className="headline text-3xl leading-tight">
            {copy.heading}
            <span className="auth-cursor" aria-hidden />
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{copy.blurb}</p>
        </div>
        <p
          className="auth-rise relative text-xs text-muted-foreground"
          style={{ animationDelay: "240ms" }}
        >
          {copy.footnote ?? "Access is granted by the newsroom."}
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="auth-rise">
            <h1 className="text-xl font-semibold tracking-tight">
              {mode === "signin" ? copy.formTitle : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{copy.formHint}</p>
          </div>

          {googleAvailable ? (
            <>
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
            </>
          ) : (
            <div className="mt-6" />
          )}


          {confirmationEmail ? (
            <div
              className="auth-rise mt-6 border-y border-border py-5"
              style={{ animationDelay: "200ms" }}
              role="status"
            >
              <p className="text-sm font-semibold">Confirm your email to continue</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We sent a confirmation link to <span className="font-medium text-foreground">{confirmationEmail}</span>.
                Open it, then return here to sign in.
              </p>
              <button
                type="button"
                className="story-link mt-4 text-sm font-medium text-foreground underline underline-offset-4"
                onClick={() => {
                  setConfirmationEmail(null);
                  setMode("signin");
                }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
          <form className="auth-rise space-y-3" style={{ animationDelay: "200ms" }} onSubmit={submit}>
            {mode === "signup" ? (
              <div>
                <label htmlFor="a-name" className="mb-1.5 block text-sm font-medium">
                  Full name
                </label>
                <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
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
                className={inputCls}
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
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="relative h-10 w-full overflow-hidden rounded-sm bg-primary text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
              </span>
              {busy ? (
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--primary-foreground)_28%,transparent),transparent)]"
                  style={{ animation: "auth-sweep 1.1s linear infinite" }}
                />
              ) : null}
            </button>
          </form>
          )}

          {!confirmationEmail && copy.allowSignUp ? (
            <p className="auth-rise mt-5 text-sm text-muted-foreground" style={{ animationDelay: "260ms" }}>
              {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="story-link font-medium text-foreground underline underline-offset-4"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          ) : (
            <p className="auth-rise mt-5 text-sm text-muted-foreground" style={{ animationDelay: "260ms" }}>
              Want to write for us?{" "}
              <Link to="/join" className="story-link font-medium text-foreground underline underline-offset-4">
                Join The Dispatch
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

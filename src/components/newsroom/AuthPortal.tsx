import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/site/BrandLogo";
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
  const [showPassword, setShowPassword] = useState(false);
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
    "h-12 w-full rounded-sm border border-input bg-background px-11 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-secondary-accent focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--secondary-accent)_14%,transparent)]";

  return (
    <main className="grid min-h-screen bg-auth-night lg:grid-cols-[minmax(0,1.18fr)_minmax(430px,0.82fr)]">
      <section className="relative flex min-h-[245px] flex-col justify-between overflow-hidden border-b border-auth-line bg-auth-night px-6 py-7 text-auth-on-night sm:px-10 lg:min-h-screen lg:border-r lg:border-b-0 lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]"
        >
          <div className="auth-ticker space-y-5 p-8 lg:space-y-8 lg:p-14">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((h, i) => (
              <p key={i} className="headline whitespace-nowrap text-3xl lg:text-5xl">
                {h}
              </p>
            ))}
          </div>
        </div>

        <div className="auth-rise relative flex items-start justify-between gap-6">
          <div>
            <Link to="/" aria-label="The Dispatch" className="inline-block rounded-sm bg-paper px-3 py-2">
              <BrandLogo className="w-48 sm:w-56" />
            </Link>
            <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-auth-muted">
              Independent reporting · Since 2026
            </p>
          </div>
          <span className="hidden border-t border-auth-red pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-auth-muted sm:block">
            Account desk
          </span>
        </div>

        <div className="auth-rise relative max-w-xl [animation-delay:120ms]">
          <div className="mb-5 hidden items-center gap-3 lg:flex">
            <span className="h-px w-10 bg-auth-red" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-auth-muted">
              {copy.eyebrow}
            </span>
          </div>
          <p className="headline max-w-lg text-[2rem] leading-[1.02] text-auth-on-night sm:text-4xl lg:text-6xl">
            {copy.heading}
            <span className="auth-cursor" aria-hidden />
          </p>
          <p className="mt-5 hidden max-w-md text-sm leading-6 text-auth-muted sm:block lg:text-base lg:leading-7">
            {copy.blurb}
          </p>
          <div className="mt-7 hidden gap-6 text-xs text-auth-muted lg:flex">
            <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-auth-teal" />Save stories</span>
            <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-auth-teal" />Follow journalists</span>
            <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-auth-teal" />Publish when approved</span>
          </div>
        </div>
        <p
          className="auth-rise relative hidden text-xs text-auth-muted [animation-delay:240ms] lg:block"
        >
          {copy.footnote ?? "Access is granted by the newsroom."}
        </p>
      </section>

      <section className="relative flex items-center justify-center bg-paper px-6 py-12 sm:px-10 lg:py-16">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--auth-red)_0_38%,var(--auth-teal)_38%_100%)]" />
        <div className="w-full max-w-md">
          <div className="auth-rise border-b border-border pb-6">
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
              Member access
            </p>
            <h1 className="headline text-3xl text-foreground sm:text-4xl">
              {mode === "signin" ? copy.formTitle : "Create your account"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {mode === "signin" ? copy.formHint : "Start reading, following and applying to write with one account."}
            </p>
          </div>

          {googleAvailable ? (
            <>
              <Button
                type="button"
                onClick={google}
                variant="outline"
                className="auth-rise mt-6 h-12 w-full rounded-sm bg-background text-sm [animation-delay:80ms] hover:-translate-y-0.5 hover:border-border-strong hover:bg-background hover:shadow-sm active:translate-y-0"
              >
                Continue with Google
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>

              <div
                className="auth-rise my-6 flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-muted-foreground [animation-delay:140ms]"
              >
                <span className="h-px flex-1 bg-border" />
                or use email
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
              <Button
                type="button"
                variant="link"
                className="story-link mt-4 text-sm font-medium text-foreground underline underline-offset-4"
                onClick={() => {
                  setConfirmationEmail(null);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
          <form className="auth-rise space-y-4 [animation-delay:200ms]" onSubmit={submit}>
            {mode === "signup" ? (
              <div>
                <label htmlFor="a-name" className="mb-1.5 block text-sm font-medium">
                  Full name
                </label>
                <div className="relative">
                  <Mail aria-hidden className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="a-name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </div>
              </div>
            ) : null}
            <div>
              <label htmlFor="a-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail aria-hidden className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="a-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="a-password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <LockKeyhole aria-hidden className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="a-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-11`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-1.5 h-9 w-9 -translate-y-1/2 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="relative mt-2 h-12 w-full overflow-hidden rounded-sm bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-lg active:translate-y-0 disabled:opacity-60"
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
              {!busy ? <ArrowRight className="relative z-10 ml-1 h-4 w-4" /> : null}
            </Button>
          </form>
          )}

          {!confirmationEmail && copy.allowSignUp ? (
            <p className="auth-rise mt-6 border-t border-border pt-5 text-sm text-muted-foreground [animation-delay:260ms]">
              {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
              <Button
                type="button"
                variant="link"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="story-link h-auto p-0 font-semibold text-foreground underline underline-offset-4"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </Button>
            </p>
          ) : (
            <p className="auth-rise mt-5 text-sm text-muted-foreground" style={{ animationDelay: "260ms" }}>
              Want to write for us?{" "}
              <Link to="/join" className="story-link font-medium text-foreground underline underline-offset-4">
                Join The Dispatch
              </Link>
            </p>
          )}
          <p className="mt-8 text-[0.68rem] leading-5 text-muted-foreground">
            By continuing, you agree to respectful participation in The Dispatch community.
          </p>
        </div>
      </section>
    </main>
  );
}

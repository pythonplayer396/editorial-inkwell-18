import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { BrandLogo } from "@/components/site/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { adminLogin } from "@/lib/rian-auth.functions";

export const Route = createFileRoute("/rian")({
  head: () => ({
    meta: [
      { title: "Admin sign in — The Dispatch" },
      { name: "description", content: "Private admin sign in for The Dispatch." },
      { property: "og:title", content: "Admin sign in — The Dispatch" },
      { property: "og:description", content: "Private admin sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RianLogin,
});

function RianLogin() {
  const login = useServerFn(adminLogin);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await login({
        data: { username: String(f.get("username")), password: String(f.get("password")) },
      });
      if (!r.ok) {
        setError("Wrong name or password.");
        return;
      }
      await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
      void navigate({ to: "/admin" });
    } catch {
      setError("Couldn't sign in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border-t-4 border-primary bg-background p-8 shadow-sm">
        <BrandLogo />
        <h1 className="mt-6 text-xl font-bold">Admin sign in</h1>
        <label className="mt-5 block text-sm font-medium">
          Name
          <input name="username" required autoComplete="username" className="mt-1 h-10 w-full border border-input bg-background px-3" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 h-10 w-full border border-input bg-background px-3" />
        </label>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <button disabled={busy} className="mt-6 h-10 w-full bg-primary font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

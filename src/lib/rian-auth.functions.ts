import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "rianhqhq1122@gmail.com";

function same(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => ({
    username: String(d.username ?? "").slice(0, 100),
    password: String(d.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const okUser = same(data.username.trim(), process.env.ADMIN_USERNAME ?? "rian3030");
    const okPass = same(data.password, process.env.ADMIN_PASSWORD ?? "rian3030@");
    if (!okUser || !okPass) return { ok: false as const };

    const pub = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let res = await pub.auth.signInWithPassword({ email: ADMIN_EMAIL, password: data.password });
    if (res.error) {
      // Sync the admin account's password to the admin credentials, then retry.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const user = list?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
      if (!user) return { ok: false as const };
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: data.password,
        email_confirm: true,
      });
      res = await pub.auth.signInWithPassword({ email: ADMIN_EMAIL, password: data.password });
      if (res.error || !res.data.session) return { ok: false as const };
    }
    const s = res.data.session!;
    return { ok: true as const, access_token: s.access_token, refresh_token: s.refresh_token };
  });

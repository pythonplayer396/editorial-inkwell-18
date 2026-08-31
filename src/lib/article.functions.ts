import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Post } from "./types";

const POST_SELECT =
  "*, category:categories(id,slug,name,description,sort_order), author:profiles(id,user_id,slug,display_name,job_title,bio,avatar_url,email,twitter,linkedin,website)";

/**
 * Public, unauthenticated read used by the article route loader so headlines and
 * metadata are server-rendered for crawlers and social previews.
 */
export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return null;

    const endpoint = `${url}/rest/v1/posts?slug=eq.${encodeURIComponent(
      data.slug,
    )}&status=eq.published&select=${encodeURIComponent(POST_SELECT)}&limit=1`;

    const res = await fetch(endpoint, {
      headers: { apikey: key, accept: "application/json" },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Post[];
    return rows[0] ?? null;
  });

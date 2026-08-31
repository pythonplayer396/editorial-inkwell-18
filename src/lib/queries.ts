import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  CommentRow,
  MediaItem,
  Post,
  Profile,
  SiteSettings,
  Tag,
} from "./types";

const POST_SELECT =
  "*, category:categories(id,slug,name,description,sort_order), author:profiles(id,user_id,slug,display_name,job_title,bio,avatar_url,email,twitter,linkedin,website)";

// The generated Supabase types lag new tables, so we narrow through unknown once
// here rather than sprinkling casts across the UI layer.
const db = supabase as unknown as {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ error: unknown }>;
};

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const publishedFilter = (q: any) =>
  q.eq("status", "published").not("published_at", "is", null).lte("published_at", new Date().toISOString());

/* ---------------- Public reads ---------------- */

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () =>
    unwrap<SiteSettings>(await db.from("site_settings").select("*").eq("id", true).maybeSingle()),
  staleTime: 60_000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    unwrap<Category[]>(await db.from("categories").select("*").order("sort_order")),
  staleTime: 60_000,
});

export const tagsQuery = queryOptions({
  queryKey: ["tags"],
  queryFn: async () => unwrap<Tag[]>(await db.from("tags").select("*").order("name")),
  staleTime: 60_000,
});

export const authorsQuery = queryOptions({
  queryKey: ["authors"],
  queryFn: async () =>
    unwrap<Profile[]>(await db.from("profiles").select("*").order("display_name")),
  staleTime: 60_000,
});

export function publishedPostsQuery(options?: {
  categorySlug?: string | undefined;
  authorSlug?: string | undefined;
  tagSlug?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  key?: string | undefined;
}) {
  const { categorySlug, authorSlug, tagSlug, limit = 12, offset = 0, key = "list" } = options ?? {};
  return queryOptions({
    queryKey: ["posts", key, categorySlug, authorSlug, tagSlug, limit, offset],
    queryFn: async () => {
      let ids: string[] | null = null;
      if (tagSlug) {
        const tag = unwrap<{ id: string } | null>(
          await db.from("tags").select("id").eq("slug", tagSlug).maybeSingle(),
        );
        if (!tag) return [] as Post[];
        const links = unwrap<{ post_id: string }[]>(
          await db.from("post_tags").select("post_id").eq("tag_id", tag.id),
        );
        ids = links.map((l) => l.post_id);
        if (ids.length === 0) return [] as Post[];
      }
      let q = publishedFilter(db.from("posts").select(POST_SELECT));
      if (categorySlug) {
        const cat = unwrap<{ id: string } | null>(
          await db.from("categories").select("id").eq("slug", categorySlug).maybeSingle(),
        );
        if (!cat) return [] as Post[];
        q = q.eq("category_id", cat.id);
      }
      if (authorSlug) {
        const author = unwrap<{ id: string } | null>(
          await db.from("profiles").select("id").eq("slug", authorSlug).maybeSingle(),
        );
        if (!author) return [] as Post[];
        q = q.eq("author_id", author.id);
      }
      if (ids) q = q.in("id", ids);
      return unwrap<Post[]>(
        await q.order("published_at", { ascending: false }).range(offset, offset + limit - 1),
      );
    },
  });
}

export const mostReadQuery = queryOptions({
  queryKey: ["posts", "most-read"],
  queryFn: async () =>
    unwrap<Post[]>(
      await publishedFilter(db.from("posts").select(POST_SELECT))
        .order("view_count", { ascending: false })
        .limit(5),
    ),
});

export const editorsPicksQuery = queryOptions({
  queryKey: ["posts", "editors-picks"],
  queryFn: async () =>
    unwrap<Post[]>(
      await publishedFilter(db.from("posts").select(POST_SELECT))
        .eq("is_editors_pick", true)
        .order("published_at", { ascending: false })
        .limit(4),
    ),
});

export function postBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["post", slug],
    queryFn: async () =>
      unwrap<Post | null>(
        await db.from("posts").select(POST_SELECT).eq("slug", slug).maybeSingle(),
      ),
  });
}

export function profileBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["profile", slug],
    queryFn: async () =>
      unwrap<Profile | null>(await db.from("profiles").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function categoryBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["category", slug],
    queryFn: async () =>
      unwrap<Category | null>(await db.from("categories").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function postTagsQuery(postId: string | undefined) {
  return queryOptions({
    queryKey: ["post-tags", postId],
    enabled: Boolean(postId),
    queryFn: async () => {
      const rows = unwrap<{ tag: Tag }[]>(
        await db.from("post_tags").select("tag:tags(id,slug,name)").eq("post_id", postId),
      );
      return rows.map((r) => r.tag).filter(Boolean);
    },
  });
}

export function searchPostsQuery(params: {
  q: string;
  category?: string | undefined;
  since?: string | undefined;
}) {
  const { q, category, since } = params;
  return queryOptions({
    queryKey: ["search", q, category, since],
    queryFn: async () => {
      let query = publishedFilter(db.from("posts").select(POST_SELECT));
      if (q.trim()) {
        const term = `%${q.trim()}%`;
        query = query.or(`title.ilike.${term},subtitle.ilike.${term},excerpt.ilike.${term}`);
      }
      if (category) {
        const cat = unwrap<{ id: string } | null>(
          await db.from("categories").select("id").eq("slug", category).maybeSingle(),
        );
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (since) query = query.gte("published_at", since);
      return unwrap<Post[]>(await query.order("published_at", { ascending: false }).limit(40));
    },
  });
}

export function approvedCommentsQuery(postId: string | undefined) {
  return queryOptions({
    queryKey: ["comments", postId],
    enabled: Boolean(postId),
    queryFn: async () =>
      unwrap<CommentRow[]>(
        await db
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .eq("status", "approved")
          .order("created_at", { ascending: true }),
      ),
  });
}

export async function registerView(slug: string) {
  await db.rpc("increment_post_view", { _slug: slug });
}

/* ---------------- Newsroom (admin) reads ---------------- */

export const adminPostsQuery = queryOptions({
  queryKey: ["admin", "posts"],
  queryFn: async () =>
    unwrap<Post[]>(
      await db.from("posts").select(POST_SELECT).order("updated_at", { ascending: false }),
    ),
});

export function adminPostQuery(id: string) {
  return queryOptions({
    queryKey: ["admin", "post", id],
    queryFn: async () =>
      unwrap<Post | null>(await db.from("posts").select(POST_SELECT).eq("id", id).maybeSingle()),
  });
}

export const adminMediaQuery = queryOptions({
  queryKey: ["admin", "media"],
  queryFn: async () =>
    unwrap<MediaItem[]>(await db.from("media").select("*").order("created_at", { ascending: false })),
});

export const adminCommentsQuery = queryOptions({
  queryKey: ["admin", "comments"],
  queryFn: async () =>
    unwrap<CommentRow[]>(
      await db
        .from("comments")
        .select("*, post:posts(title,slug)")
        .order("created_at", { ascending: false }),
    ),
});

export { db };

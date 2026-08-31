import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { BlockEditor } from "@/components/admin/BlockEditor";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  Btn,
  Field,
  PageHeader,
  StatusPill,
  inputClass,
  textareaClass,
} from "@/components/admin/AdminUI";
import { BlockRenderer } from "@/components/article/BlockRenderer";
import { useCurrentUser } from "@/hooks/useAuth";
import { autoExcerpt, newBlock, readingMinutes, withIds, type Block } from "@/lib/blocks";
import { formatDate, formatDateTime, slugify, timeAgo } from "@/lib/format";
import {
  adminPostQuery,
  authorsQuery,
  categoriesQuery,
  db,
  postTagsQuery,
  tagsQuery,
} from "@/lib/queries";
import {
  pruneAutosaves,
  revisionsQuery,
  saveRevision,
  snapshotSignature,
  type PostRevision,
  type RevisionSnapshot,
} from "@/lib/revisions";
import type { PostStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

export const Route = createFileRoute("/admin/posts/$id")({
  component: EditorPage,
});

interface Draft {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  dateline: string;
  cover_url: string;
  cover_caption: string;
  cover_credit: string;
  category_id: string;
  author_id: string;
  status: PostStatus;
  is_breaking: boolean;
  is_featured: boolean;
  is_editors_pick: boolean;
  scheduled_for: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  dateline: "",
  cover_url: "",
  cover_caption: "",
  cover_credit: "",
  category_id: "",
  author_id: "",
  status: "draft",
  is_breaking: false,
  is_featured: false,
  is_editors_pick: false,
  scheduled_for: "",
  seo_title: "",
  seo_description: "",
  canonical_url: "",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function EditorPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profile } = useCurrentUser();

  const post = useQuery({ ...adminPostQuery(id), enabled: !isNew });
  const categories = useQuery(categoriesQuery);
  const authors = useQuery(authorsQuery);
  const allTags = useQuery(tagsQuery);
  const postTags = useQuery({ ...postTagsQuery(isNew ? undefined : id), enabled: !isNew });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [blocks, setBlocks] = useState<Block[]>([newBlock("paragraph")]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [coverPicker, setCoverPicker] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setDraft((d) => ({ ...d, author_id: d.author_id || (profile?.id ?? "") }));
      return;
    }
    const p = post.data;
    if (!p || loadedId === p.id) return;
    setLoadedId(p.id);
    setDraft({
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle ?? "",
      excerpt: p.excerpt ?? "",
      dateline: p.dateline ?? "",
      cover_url: p.cover_url ?? "",
      cover_caption: p.cover_caption ?? "",
      cover_credit: p.cover_credit ?? "",
      category_id: p.category_id ?? "",
      author_id: p.author_id ?? "",
      status: p.status,
      is_breaking: p.is_breaking,
      is_featured: p.is_featured,
      is_editors_pick: p.is_editors_pick,
      scheduled_for: toLocalInput(p.scheduled_for),
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      canonical_url: p.canonical_url ?? "",
    });
    setBlocks(withIds(Array.isArray(p.body) && p.body.length ? p.body : [newBlock("paragraph")]));
  }, [isNew, post.data, loadedId, profile?.id]);

  useEffect(() => {
    if (postTags.data) setTagIds(postTags.data.map((t) => t.id));
  }, [postTags.data]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const minutes = useMemo(() => readingMinutes(blocks), [blocks]);
  const words = useMemo(
    () =>
      blocks
        .map((b) => b.text ?? (b.items ?? []).join(" "))
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length,
    [blocks],
  );

  const save = useMutation({
    mutationFn: async (status?: PostStatus) => {
      const nextStatus = status ?? draft.status;
      if (!draft.title.trim()) throw new Error("Give the article a headline first.");
      const slug = (draft.slug || slugify(draft.title)).trim();

      const payload = {
        title: draft.title.trim(),
        slug,
        subtitle: draft.subtitle || null,
        excerpt: draft.excerpt || autoExcerpt(blocks) || null,
        dateline: draft.dateline || null,
        body: blocks,
        cover_url: draft.cover_url || null,
        cover_caption: draft.cover_caption || null,
        cover_credit: draft.cover_credit || null,
        category_id: draft.category_id || null,
        author_id: draft.author_id || null,
        status: nextStatus,
        is_breaking: draft.is_breaking,
        is_featured: draft.is_featured,
        is_editors_pick: draft.is_editors_pick,
        scheduled_for:
          nextStatus === "scheduled" && draft.scheduled_for
            ? new Date(draft.scheduled_for).toISOString()
            : null,
        published_at:
          nextStatus === "published"
            ? (post.data?.published_at ?? new Date().toISOString())
            : nextStatus === "scheduled" && draft.scheduled_for
              ? new Date(draft.scheduled_for).toISOString()
              : null,
        seo_title: draft.seo_title || null,
        seo_description: draft.seo_description || null,
        canonical_url: draft.canonical_url || null,
        reading_minutes: minutes,
      };

      let postId = isNew ? null : id;
      if (isNew) {
        const { data, error } = await db.from("posts").insert(payload).select("id").single();
        if (error) throw new Error((error as { message: string }).message);
        postId = data.id as string;
      } else {
        const { error } = await db.from("posts").update(payload).eq("id", id);
        if (error) throw new Error((error as { message: string }).message);
      }

      await db.from("post_tags").delete().eq("post_id", postId);
      if (tagIds.length) {
        await db.from("post_tags").insert(tagIds.map((t) => ({ post_id: postId, tag_id: t })));
      }
      return { postId: postId as string, status: nextStatus, slug };
    },
    onSuccess: async ({ postId, status, slug }) => {
      set("status", status);
      await qc.invalidateQueries({ queryKey: ["admin"] });
      await qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(
        status === "published"
          ? "Published"
          : status === "scheduled"
            ? "Scheduled"
            : status === "in_review"
              ? "Sent for review"
              : "Saved",
        {
          description:
            status === "published" ? `Live at /article/${slug}` : "Your changes are stored.",
        },
      );
      if (isNew) void navigate({ to: "/admin/posts/$id", params: { id: postId } });
    },
    onError: (err) => toast.error("Couldn't save", { description: (err as Error).message }),
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("posts").delete().eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Article deleted");
      void navigate({ to: "/admin/posts" });
    },
    onError: (err) => toast.error("Couldn't delete", { description: (err as Error).message }),
  });

  const busy = save.isPending;

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title={isNew ? "New article" : draft.title || "Untitled article"}
        description={`${words} words · about ${minutes} min read${
          draft.status === "published" && post.data?.published_at
            ? ` · published ${formatDate(post.data.published_at)}`
            : ""
        }`}
        actions={
          <>
            <StatusPill status={draft.status} />
            <Btn variant="outline" disabled={busy} onClick={() => save.mutate(undefined)}>
              {busy ? "Saving…" : "Save"}
            </Btn>
            {draft.status !== "published" ? (
              <Btn disabled={busy} onClick={() => save.mutate("published")}>
                Publish
              </Btn>
            ) : (
              <Link to="/article/$slug" params={{ slug: draft.slug }}>
                <Btn variant="outline">View live</Btn>
              </Link>
            )}
          </>
        }
      />

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-4 flex gap-1.5">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
                  tab === t ? "bg-foreground text-background" : "border border-border"
                }`}
              >
                {t === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>

          {tab === "write" ? (
            <div className="space-y-4">
              <input
                value={draft.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="Headline"
                aria-label="Headline"
                className="w-full border-none bg-transparent font-serif text-3xl font-semibold leading-tight tracking-tight outline-none placeholder:text-muted-foreground/50"
              />
              <input
                value={draft.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="Standfirst — one sentence on why this matters"
                aria-label="Standfirst"
                className="w-full border-none bg-transparent font-serif text-lg leading-snug text-muted-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <div className="border-t border-border pt-4">
                <BlockEditor blocks={blocks} onChange={setBlocks} />
              </div>
            </div>
          ) : (
            <article className="border border-border bg-paper p-6 lg:p-10">
              {draft.cover_url ? (
                <img
                  src={draft.cover_url}
                  alt={draft.title}
                  className="mb-6 aspect-[16/9] w-full bg-muted object-cover"
                />
              ) : null}
              <p className="kicker text-accent">
                {categories.data?.find((c) => c.id === draft.category_id)?.name ?? "Uncategorised"}
              </p>
              <h1 className="headline mt-2 text-3xl leading-tight lg:text-4xl">
                {draft.title || "Untitled article"}
              </h1>
              {draft.subtitle ? (
                <p className="mt-3 font-serif text-lg text-muted-foreground">{draft.subtitle}</p>
              ) : null}
              <p className="mt-4 text-xs text-muted-foreground">
                {authors.data?.find((a) => a.id === draft.author_id)?.display_name ?? "Staff"} ·{" "}
                {minutes} min read
              </p>
              <div className="prose-article mt-8">
                <BlockRenderer blocks={blocks} />
              </div>
            </article>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Panel title="Publishing">
            <Field label="Status" htmlFor="f-status">
              <select
                id="f-status"
                value={draft.status}
                onChange={(e) => set("status", e.target.value as PostStatus)}
                className={inputClass}
              >
                {(Object.keys(STATUS_LABELS) as PostStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            {draft.status === "scheduled" ? (
              <Field label="Publish at" htmlFor="f-sched">
                <input
                  id="f-sched"
                  type="datetime-local"
                  value={draft.scheduled_for}
                  onChange={(e) => set("scheduled_for", e.target.value)}
                  className={inputClass}
                />
              </Field>
            ) : null}
            <div className="space-y-2 pt-1">
              <Toggle
                label="Breaking news"
                checked={draft.is_breaking}
                onChange={(v) => set("is_breaking", v)}
              />
              <Toggle
                label="Featured on homepage"
                checked={draft.is_featured}
                onChange={(v) => set("is_featured", v)}
              />
              <Toggle
                label="Editor's pick"
                checked={draft.is_editors_pick}
                onChange={(v) => set("is_editors_pick", v)}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Btn variant="outline" disabled={busy} onClick={() => save.mutate("in_review")}>
                Send for review
              </Btn>
              {!isNew ? (
                <Btn
                  variant="danger"
                  disabled={del.isPending}
                  onClick={() => {
                    if (confirm("Delete this article permanently?")) del.mutate();
                  }}
                >
                  Delete
                </Btn>
              ) : null}
            </div>
          </Panel>

          <Panel title="Story details">
            <Field label="URL slug" htmlFor="f-slug" hint={`/article/${draft.slug || "…"}`}>
              <input
                id="f-slug"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className={inputClass}
              />
            </Field>
            <Field label="Section" htmlFor="f-cat">
              <select
                id="f-cat"
                value={draft.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Byline" htmlFor="f-author">
              <select
                id="f-author"
                value={draft.author_id}
                onChange={(e) => set("author_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {(authors.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.display_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Dateline" htmlFor="f-dateline" hint="e.g. BRUSSELS">
              <input
                id="f-dateline"
                value={draft.dateline}
                onChange={(e) => set("dateline", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Summary" htmlFor="f-excerpt" hint="Used on cards and in search results.">
              <textarea
                id="f-excerpt"
                rows={3}
                value={draft.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder={autoExcerpt(blocks) || "Short summary"}
                className={textareaClass}
              />
            </Field>
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {(allTags.data ?? []).map((t) => {
                  const on = tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setTagIds(on ? tagIds.filter((x) => x !== t.id) : [...tagIds, t.id])
                      }
                      className={`rounded-sm border px-2 py-1 text-xs transition-colors ${
                        on ? "border-foreground bg-foreground text-background" : "border-border"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Panel>

          <Panel title="Cover image">
            {draft.cover_url ? (
              <img
                src={draft.cover_url}
                alt=""
                className="aspect-[16/9] w-full bg-muted object-cover"
              />
            ) : null}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
              <input
                value={draft.cover_url}
                onChange={(e) => set("cover_url", e.target.value)}
                placeholder="Image URL"
                aria-label="Cover image URL"
                className={inputClass}
              />
              <Btn variant="outline" onClick={() => setCoverPicker(true)}>
                Library
              </Btn>
            </div>
            <input
              value={draft.cover_caption}
              onChange={(e) => set("cover_caption", e.target.value)}
              placeholder="Caption"
              aria-label="Cover caption"
              className={inputClass}
            />
            <input
              value={draft.cover_credit}
              onChange={(e) => set("cover_credit", e.target.value)}
              placeholder="Credit"
              aria-label="Cover credit"
              className={inputClass}
            />
          </Panel>

          <Panel title="Search & social">
            <Field label="SEO title" htmlFor="f-seo-t" hint={`${draft.seo_title.length}/60`}>
              <input
                id="f-seo-t"
                value={draft.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder={draft.title}
                className={inputClass}
              />
            </Field>
            <Field
              label="Meta description"
              htmlFor="f-seo-d"
              hint={`${draft.seo_description.length}/160`}
            >
              <textarea
                id="f-seo-d"
                rows={3}
                value={draft.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder={draft.excerpt || autoExcerpt(blocks)}
                className={textareaClass}
              />
            </Field>
            <Field label="Canonical URL" htmlFor="f-canon">
              <input
                id="f-canon"
                value={draft.canonical_url}
                onChange={(e) => set("canonical_url", e.target.value)}
                className={inputClass}
              />
            </Field>
          </Panel>
        </aside>
      </div>

      {coverPicker ? (
        <MediaPicker
          onClose={() => setCoverPicker(false)}
          onSelect={(item) => {
            setDraft((d) => ({
              ...d,
              cover_url: item.url,
              cover_caption: d.cover_caption || (item.caption ?? ""),
              cover_credit: d.cover_credit || (item.credit ?? ""),
            }));
            setCoverPicker(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-background">
      <h2 className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3 p-3">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      {label}
    </label>
  );
}

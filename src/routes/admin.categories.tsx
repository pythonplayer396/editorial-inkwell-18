import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, PageHeader, inputClass, textareaClass } from "@/components/admin/AdminUI";
import { slugify } from "@/lib/format";
import { adminPostsQuery, categoriesQuery, db } from "@/lib/queries";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const categories = useQuery(categoriesQuery);
  const posts = useQuery(adminPostsQuery);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const refresh = () => qc.invalidateQueries();

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Give the section a name.");
      const { error } = await db.from("categories").insert({
        name: name.trim(),
        slug: slugify(name),
        description: description || null,
        sort_order: (categories.data?.length ?? 0) + 1,
      });
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      setName("");
      setDescription("");
      await refresh();
      toast.success("Section added");
    },
    onError: (e) => toast.error("Couldn't add it", { description: (e as Error).message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("categories").delete().eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await refresh();
      toast.success("Section removed");
    },
    onError: (e) => toast.error("Couldn't remove it", { description: (e as Error).message }),
  });

  const count = (id: string) => (posts.data ?? []).filter((p) => p.category_id === id).length;

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Sections"
        description="The mastheads of the paper — Politics, Business, Culture and the rest."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Slug</th>
                <th className="px-3 py-2 text-right font-medium">Articles</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(categories.data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{c.name}</span>
                    {c.description ? (
                      <span className="block text-xs text-muted-foreground">{c.description}</span>
                    ) : null}
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell">
                    /{c.slug}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {count(c.id)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove the ${c.name} section?`)) remove.mutate(c.id);
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="space-y-3 border border-border p-3">
          <p className="text-sm font-semibold">New section</p>
          <Field label="Name" htmlFor="c-name" hint={name ? `/category/${slugify(name)}` : undefined}>
            <input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description" htmlFor="c-desc">
            <textarea
              id="c-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaClass}
            />
          </Field>
          <Btn disabled={create.isPending} onClick={() => create.mutate()}>
            Add section
          </Btn>
        </aside>
      </div>
    </div>
  );
}

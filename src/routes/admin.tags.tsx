import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, PageHeader, inputClass } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui-kit/States";
import { slugify } from "@/lib/format";
import { db, tagsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/tags")({
  component: TagsPage,
});

function TagsPage() {
  const qc = useQueryClient();
  const tags = useQuery(tagsQuery);
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Type a tag name.");
      const { error } = await db.from("tags").insert({ name: name.trim(), slug: slugify(name) });
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      setName("");
      await qc.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag added");
    },
    onError: (e) => toast.error("Couldn't add the tag", { description: (e as Error).message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("tags").delete().eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag removed");
    },
  });

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader title="Tags" description="Cross-cutting topics that thread stories together." />

      <form
        className="mt-5 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag, e.g. Climate policy"
          aria-label="New tag"
          className={inputClass}
        />
        <Btn type="submit" disabled={create.isPending}>
          Add
        </Btn>
      </form>

      <div className="mt-6">
        {(tags.data ?? []).length === 0 && !tags.isLoading ? (
          <EmptyState title="No tags yet" description="Add the topics your newsroom follows." />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {(tags.data ?? []).map((t) => (
              <li
                key={t.id}
                className="inline-flex items-center gap-2 border border-border px-2.5 py-1 text-sm"
              >
                {t.name}
                <button
                  type="button"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => remove.mutate(t.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

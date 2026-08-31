import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Btn, PageHeader, inputClass } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui-kit/States";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";
import { formatBytes, uploadMedia } from "@/lib/media";
import { adminMediaQuery, db } from "@/lib/queries";
import type { MediaItem } from "@/lib/types";

export const Route = createFileRoute("/admin/media")({
  component: MediaPage,
});

function MediaPage() {
  const { session } = useCurrentUser();
  const qc = useQueryClient();
  const media = useQuery(adminMediaQuery);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const upload = async (files: FileList) => {
    setBusy(true);
    try {
      for (const file of Array.from(files)) await uploadMedia(file, session?.user.id);
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success(`${files.length} file${files.length === 1 ? "" : "s"} uploaded`);
    } catch (err) {
      toast.error("Upload didn't work", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const saveMeta = useMutation({
    mutationFn: async (item: MediaItem) => {
      const { error } = await db
        .from("media")
        .update({ alt_text: item.alt_text, caption: item.caption, credit: item.credit })
        .eq("id", item.id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Details saved");
    },
    onError: (e) => toast.error("Couldn't save", { description: (e as Error).message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("media").delete().eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      setSelected(null);
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Removed from library");
    },
  });

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Media"
        description="Photographs and graphics, with the credits and alt text that must travel with them."
        actions={
          <Btn disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "Uploading…" : "Upload images"}
          </Btn>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void upload(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {(media.data ?? []).length === 0 && !media.isLoading ? (
            <EmptyState
              title="The library is empty"
              description="Upload photographs once and reuse them across stories, with credits attached."
              action={<Btn onClick={() => fileRef.current?.click()}>Upload images</Btn>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {(media.data ?? []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`text-left transition-opacity hover:opacity-85 ${
                    selected?.id === item.id ? "ring-2 ring-accent" : ""
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.alt_text ?? item.file_name}
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-muted object-cover"
                  />
                  <p className="mt-1 truncate text-xs">{item.file_name}</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {formatBytes(item.size_bytes)} · {formatDate(item.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {selected ? (
            <div className="space-y-3 border border-border p-3">
              <img
                src={selected.url}
                alt={selected.alt_text ?? ""}
                className="w-full bg-muted object-cover"
              />
              <p className="truncate text-xs text-muted-foreground">
                {selected.width && selected.height
                  ? `${selected.width}×${selected.height} · `
                  : ""}
                {formatBytes(selected.size_bytes)}
              </p>
              <input
                value={selected.alt_text ?? ""}
                onChange={(e) => setSelected({ ...selected, alt_text: e.target.value })}
                placeholder="Alt text"
                aria-label="Alt text"
                className={inputClass}
              />
              <input
                value={selected.caption ?? ""}
                onChange={(e) => setSelected({ ...selected, caption: e.target.value })}
                placeholder="Caption"
                aria-label="Caption"
                className={inputClass}
              />
              <input
                value={selected.credit ?? ""}
                onChange={(e) => setSelected({ ...selected, credit: e.target.value })}
                placeholder="Credit"
                aria-label="Credit"
                className={inputClass}
              />
              <div className="flex gap-2">
                <Btn disabled={saveMeta.isPending} onClick={() => saveMeta.mutate(selected)}>
                  Save
                </Btn>
                <Btn variant="danger" onClick={() => remove.mutate(selected.id)}>
                  Remove
                </Btn>
              </div>
            </div>
          ) : (
            <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">
              Select an image to edit its alt text, caption and credit.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

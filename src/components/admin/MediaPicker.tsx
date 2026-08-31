import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useAuth";
import { formatBytes, uploadMedia } from "@/lib/media";
import { adminMediaQuery } from "@/lib/queries";
import type { MediaItem } from "@/lib/types";
import { Btn } from "./AdminUI";

export function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}) {
  const { session } = useCurrentUser();
  const qc = useQueryClient();
  const media = useQuery(adminMediaQuery);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const item = await uploadMedia(file, session?.user.id);
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
      onSelect(item as MediaItem);
    } catch (err) {
      toast.error("Upload didn't work", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col border border-border bg-background shadow-lg">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
          <p className="truncate text-sm font-semibold">Media library</p>
          <div className="flex shrink-0 gap-2">
            <Btn variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Uploading…" : "Upload"}
            </Btn>
            <Btn variant="ghost" onClick={onClose}>
              Close
            </Btn>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />

        <div className="grid gap-3 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4">
          {(media.data ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="group text-left"
            >
              <img
                src={item.url}
                alt={item.alt_text ?? item.file_name}
                className="aspect-[4/3] w-full bg-muted object-cover transition-opacity group-hover:opacity-80"
              />
              <p className="mt-1 truncate text-xs">{item.file_name}</p>
              <p className="text-[0.7rem] text-muted-foreground">{formatBytes(item.size_bytes)}</p>
            </button>
          ))}
          {!media.isLoading && (media.data ?? []).length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Nothing in the library yet. Upload your first image.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

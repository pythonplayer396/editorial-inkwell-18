import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { uploadMedia } from "@/lib/media";
import { useCurrentUser } from "@/hooks/useAuth";
import { Field, Btn, inputClass } from "@/components/admin/AdminUI";

export interface ImageValue {
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
}

/**
 * File-first image upload: drag & drop, click, or choose a file.
 * No URLs, no technical vocabulary.
 */
export function ImageUploader({
  value,
  onChange,
  label = "Featured image",
  hint = "Drop a photo here, or choose one from your device.",
}: {
  value: ImageValue | null;
  onChange: (next: ImageValue | null) => void;
  label?: string;
  hint?: string;
}) {
  const { userId } = useCurrentUser();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image", {
        description: "Please choose a JPG, PNG, WebP or GIF file.",
      });
      return;
    }
    setBusy(true);
    try {
      const item = await uploadMedia(file, userId);
      onChange({ url: item.url, alt: item.alt_text ?? "", caption: "", credit: "" });
      toast.success("Photo added");
    } catch {
      toast.error("We couldn't upload this image", {
        description: "Check the file type or size and try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium">{label}</p>

      {value?.url ? (
        <div className="premium-surface overflow-hidden">
          <div className="relative">
            <img
              src={value.url}
              alt={value.alt || "Selected photograph"}
              className="image-reveal max-h-72 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove photo"
              className="pressable absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-background/90 backdrop-blur transition-transform hover:scale-105"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3 p-3">
            <Field label="Alt text" hint="Describe the photo for readers who can't see it.">
              <input
                className={inputClass}
                value={value.alt ?? ""}
                onChange={(e) => onChange({ ...value, alt: e.target.value })}
              />
            </Field>
            <Field label="Caption">
              <input
                className={inputClass}
                value={value.caption ?? ""}
                onChange={(e) => onChange({ ...value, caption: e.target.value })}
              />
            </Field>
            <Field label="Photo credit">
              <input
                className={inputClass}
                value={value.credit ?? ""}
                onChange={(e) => onChange({ ...value, credit: e.target.value })}
              />
            </Field>
            <div className="flex gap-2">
              <Btn type="button" variant="outline" onClick={() => input.current?.click()}>
                Replace
              </Btn>
              <Btn type="button" variant="ghost" onClick={() => onChange(null)}>
                Remove
              </Btn>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void handleFile(e.dataTransfer.files[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-6 py-10 text-center transition-all duration-200 ${
            over
              ? "-translate-y-0.5 border-secondary-accent bg-secondary-accent-soft/40"
              : "border-border hover:border-border-strong hover:bg-muted/40"
          }`}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {busy ? "Uploading your photo…" : "Drop an image here"}
          </span>
          <span className="text-xs text-muted-foreground">or</span>
          <span className="inline-flex h-8 items-center rounded-sm border border-border px-3 text-xs font-medium">
            Select file
          </span>
          <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
        </button>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

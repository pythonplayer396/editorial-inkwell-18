import { supabase } from "@/integrations/supabase/client";
import { db } from "./queries";
import { slugify } from "./format";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

async function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export async function uploadMedia(file: File, userId?: string) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${new Date().getUTCFullYear()}/${Date.now()}-${slugify(
    file.name.replace(/\.[^.]+$/, ""),
  )}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data: signed, error: signError } = await supabase.storage
    .from("media")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !signed) throw new Error(signError?.message ?? "Could not create a link");

  const { width, height } = await imageSize(file);

  const { data, error } = await db
    .from("media")
    .insert({
      url: signed.signedUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      width,
      height,
      uploaded_by: userId ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error((error as { message: string }).message);
  return data;
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, PageHeader, inputClass, textareaClass } from "@/components/admin/AdminUI";
import { db, settingsQuery } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery(settingsQuery);
  const [form, setForm] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (settings.data && !form) setForm(settings.data);
  }, [settings.data, form]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) return;
      const { error } = await db
        .from("site_settings")
        .update({
          site_name: form.site_name,
          tagline: form.tagline,
          breaking_enabled: form.breaking_enabled,
          breaking_text: form.breaking_text,
          breaking_href: form.breaking_href,
          about_text: form.about_text,
          contact_email: form.contact_email,
          twitter: form.twitter,
          linkedin: form.linkedin,
        })
        .eq("id", true);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error("Couldn't save", { description: (e as Error).message }),
  });

  if (!form) {
    return (
      <div className="px-5 py-6 lg:px-8">
        <PageHeader title="Settings" />
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Settings"
        description="The publication's name, voice and the banner across the top of the site."
        actions={
          <Btn disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Btn>
        }
      />

      <div className="mt-6 grid max-w-3xl gap-6 md:grid-cols-2">
        <section className="space-y-3 border border-border p-4 md:col-span-2">
          <p className="text-sm font-semibold">Masthead</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Publication name" htmlFor="s-name">
              <input
                id="s-name"
                value={form.site_name}
                onChange={(e) => set("site_name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Tagline" htmlFor="s-tag">
              <input
                id="s-tag"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="About the publication" htmlFor="s-about">
            <textarea
              id="s-about"
              rows={5}
              value={form.about_text ?? ""}
              onChange={(e) => set("about_text", e.target.value)}
              className={textareaClass}
            />
          </Field>
        </section>

        <section className="space-y-3 border border-border p-4">
          <p className="text-sm font-semibold">Breaking news bar</p>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.breaking_enabled}
              onChange={(e) => set("breaking_enabled", e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Show the bar on the site
          </label>
          <Field label="Message" htmlFor="s-bt">
            <input
              id="s-bt"
              value={form.breaking_text ?? ""}
              onChange={(e) => set("breaking_text", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Link" htmlFor="s-bh" hint="e.g. /article/your-story-slug">
            <input
              id="s-bh"
              value={form.breaking_href ?? ""}
              onChange={(e) => set("breaking_href", e.target.value)}
              className={inputClass}
            />
          </Field>
        </section>

        <section className="space-y-3 border border-border p-4">
          <p className="text-sm font-semibold">Contact</p>
          <Field label="Newsroom email" htmlFor="s-mail">
            <input
              id="s-mail"
              type="email"
              value={form.contact_email ?? ""}
              onChange={(e) => set("contact_email", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="X / Twitter" htmlFor="s-tw">
            <input
              id="s-tw"
              value={form.twitter ?? ""}
              onChange={(e) => set("twitter", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="LinkedIn" htmlFor="s-li">
            <input
              id="s-li"
              value={form.linkedin ?? ""}
              onChange={(e) => set("linkedin", e.target.value)}
              className={inputClass}
            />
          </Field>
        </section>
      </div>
    </div>
  );
}

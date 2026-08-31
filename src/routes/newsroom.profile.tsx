import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Btn, Field, inputClass, textareaClass } from "@/components/admin/AdminUI";
import { ImageUploader } from "@/components/newsroom/ImageUploader";
import { useCurrentUser } from "@/hooks/useAuth";
import { myStoriesQuery } from "@/lib/newsroom";
import { db } from "@/lib/queries";

export const Route = createFileRoute("/newsroom/profile")({
  component: JournalistProfile,
});

function JournalistProfile() {
  const { userId, profile } = useCurrentUser();
  const qc = useQueryClient();
  const stories = useQuery(myStoriesQuery(userId));
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    job_title: "",
    bio: "",
    experience: "",
    coverage: "",
    twitter: "",
    linkedin: "",
    website: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      job_title: profile.job_title ?? "",
      bio: profile.bio ?? "",
      experience: (profile as { experience?: string | null }).experience ?? "",
      coverage: ((profile as { coverage_areas?: string[] | null }).coverage_areas ?? []).join(", "),
      twitter: profile.twitter ?? "",
      linkedin: profile.linkedin ?? "",
      website: profile.website ?? "",
      avatar_url: profile.avatar_url ?? "",
    });
  }, [profile]);

  const published = (stories.data ?? []).filter((p) => p.status === "published");

  const save = async () => {
    if (!profile) return;
    setBusy(true);
    try {
      const { error } = await db
        .from("profiles")
        .update({
          display_name: form.display_name,
          job_title: form.job_title || null,
          bio: form.bio || null,
          experience: form.experience || null,
          coverage_areas: form.coverage
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          twitter: form.twitter || null,
          linkedin: form.linkedin || null,
          website: form.website || null,
          avatar_url: form.avatar_url || null,
        })
        .eq("id", profile.id);
      if (error) throw new Error((error as { message: string }).message);
      toast.success("Profile saved");
      void qc.invalidateQueries({ queryKey: ["me"] });
    } catch {
      toast.error("We couldn't save your profile", { description: "Your changes are still here — try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="editorial-enter">
      <header className="border-b border-border pb-5">
        <p className="kicker">Your byline</p>
        <h1 className="headline mt-2 text-3xl">Profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This is what readers see on your public journalist page.
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <Field label="Full name">
            <input
              className={inputClass}
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </Field>
          <Field label="Title" hint="For example: Investigative journalist.">
            <input
              className={inputClass}
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            />
          </Field>
          <Field label="About">
            <textarea
              rows={4}
              className={textareaClass}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </Field>
          <Field label="Experience">
            <textarea
              rows={3}
              className={textareaClass}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
          </Field>
          <Field label="Areas of coverage" hint="Separate with commas.">
            <input
              className={inputClass}
              value={form.coverage}
              onChange={(e) => setForm({ ...form, coverage: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="X / Twitter">
              <input className={inputClass} value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
            </Field>
            <Field label="LinkedIn">
              <input className={inputClass} value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
            </Field>
            <Field label="Website">
              <input className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </Field>
          </div>
          <Btn onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </Btn>
        </section>

        <aside className="space-y-6">
          <ImageUploader
            label="Profile photograph"
            hint="A clear headshot works best."
            value={form.avatar_url ? { url: form.avatar_url } : null}
            onChange={(next) => setForm({ ...form, avatar_url: next?.url ?? "" })}
          />
          <div className="premium-surface p-4">
            <p className="text-sm font-semibold">Published work</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{published.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stories of yours currently live on The Dispatch.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

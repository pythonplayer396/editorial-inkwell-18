import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, PageHeader, inputClass, textareaClass } from "@/components/admin/AdminUI";
import { useCurrentUser } from "@/hooks/useAuth";
import { adminPostsQuery, authorsQuery, db } from "@/lib/queries";
import { ROLE_LABELS, type AppRole, type Profile } from "@/lib/types";

export const Route = createFileRoute("/admin/authors")({
  component: AuthorsPage,
});

const ASSIGNABLE: AppRole[] = ["owner", "editor", "author", "contributor"];

function AuthorsPage() {
  const qc = useQueryClient();
  const { isEditor, profile: me } = useCurrentUser();
  const authors = useQuery(authorsQuery);
  const posts = useQuery(adminPostsQuery);
  const roles = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const res = await db.from("user_roles").select("user_id, role");
      if (res.error) throw new Error((res.error as { message: string }).message);
      return res.data as Array<{ user_id: string; role: AppRole }>;
    },
  });

  const [editing, setEditing] = useState<Profile | null>(null);

  const save = useMutation({
    mutationFn: async (p: Profile) => {
      const { error } = await db
        .from("profiles")
        .update({
          display_name: p.display_name,
          job_title: p.job_title,
          bio: p.bio,
          avatar_url: p.avatar_url,
          twitter: p.twitter,
          website: p.website,
        })
        .eq("id", p.id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["authors"] });
      toast.success("Profile saved");
    },
    onError: (e) => toast.error("Couldn't save", { description: (e as Error).message }),
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      await db.from("user_roles").delete().eq("user_id", userId);
      const { error } = await db.from("user_roles").insert({ user_id: userId, role });
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "roles"] });
      toast.success("Role updated");
    },
    onError: (e) => toast.error("Couldn't change the role", { description: (e as Error).message }),
  });

  const roleOf = (userId: string | null) =>
    (roles.data ?? []).find((r) => r.user_id === userId)?.role ?? null;
  const countFor = (id: string) => (posts.data ?? []).filter((p) => p.author_id === id).length;

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Authors"
        description="Bylines, biographies and who is allowed to do what."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">Role</th>
                <th className="px-3 py-2 text-right font-medium">Articles</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(authors.data ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{a.display_name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {a.job_title ?? "Contributor"}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {isEditor && a.user_id ? (
                      <select
                        aria-label={`Role for ${a.display_name}`}
                        value={roleOf(a.user_id) ?? ""}
                        onChange={(e) =>
                          setRole.mutate({
                            userId: a.user_id as string,
                            role: e.target.value as AppRole,
                          })
                        }
                        className="h-8 rounded-sm border border-input bg-background px-2 text-xs"
                      >
                        <option value="">No access</option>
                        {ASSIGNABLE.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted-foreground">
                        {roleOf(a.user_id) ? ROLE_LABELS[roleOf(a.user_id) as AppRole] : "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {countFor(a.id)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {isEditor || me?.id === a.id ? (
                      <button
                        type="button"
                        onClick={() => setEditing(a)}
                        className="text-xs underline underline-offset-4 hover:text-accent"
                      >
                        Edit
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {editing ? (
            <div className="space-y-3 border border-border p-3">
              <p className="text-sm font-semibold">Edit profile</p>
              <Field label="Display name" htmlFor="p-name">
                <input
                  id="p-name"
                  value={editing.display_name}
                  onChange={(e) => setEditing({ ...editing, display_name: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Job title" htmlFor="p-job">
                <input
                  id="p-job"
                  value={editing.job_title ?? ""}
                  onChange={(e) => setEditing({ ...editing, job_title: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Biography" htmlFor="p-bio">
                <textarea
                  id="p-bio"
                  rows={4}
                  value={editing.bio ?? ""}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  className={textareaClass}
                />
              </Field>
              <Field label="Portrait URL" htmlFor="p-av">
                <input
                  id="p-av"
                  value={editing.avatar_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, avatar_url: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="X / Twitter handle" htmlFor="p-tw">
                <input
                  id="p-tw"
                  value={editing.twitter ?? ""}
                  onChange={(e) => setEditing({ ...editing, twitter: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <div className="flex gap-2">
                <Btn disabled={save.isPending} onClick={() => save.mutate(editing)}>
                  Save
                </Btn>
                <Btn variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Btn>
              </div>
            </div>
          ) : (
            <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">
              Select an author to edit their byline and biography. Roles decide who can publish.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Btn, PageHeader } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui-kit/States";
import { useCurrentUser } from "@/hooks/useAuth";
import { rolePermissionsQuery, staffDirectoryQuery } from "@/lib/newsroom";
import { db } from "@/lib/queries";
import { ROLE_LABELS, type AppRole } from "@/lib/types";
import { recordAudit } from "@/lib/workflow";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

const ROLES: AppRole[] = ["owner", "editor", "author", "subscriber"];

function StaffPage() {
  const qc = useQueryClient();
  const { userId, profile, isEditor } = useCurrentUser();
  const people = useQuery(staffDirectoryQuery);
  const perms = useQuery(rolePermissionsQuery);

  const setRole = async (personUserId: string | null, name: string, role: AppRole) => {
    if (!personUserId) return;
    try {
      const { error: delError } = await db.from("user_roles").delete().eq("user_id", personUserId);
      if (delError) throw new Error((delError as { message: string }).message);
      const { error } = await db.from("user_roles").insert({ user_id: personUserId, role });
      if (error) throw new Error((error as { message: string }).message);
      await recordAudit(
        { userId, name: profile?.display_name ?? "An administrator" },
        "Role changed",
        { type: "user", id: personUserId, label: name },
        `Set to ${ROLE_LABELS[role]}`,
      );
      toast.success(`${name} is now ${ROLE_LABELS[role]}`);
      void qc.invalidateQueries({ queryKey: ["admin", "staff-directory"] });
    } catch {
      toast.error("We couldn't change that role", { description: "You may not have permission." });
    }
  };

  const rows = people.data ?? [];
  const permByRole = (role: string) =>
    (perms.data ?? []).filter((p) => p.role === role).map((p) => p.permission);

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Staff & roles"
        description="Who works in the newsroom, and what each role is allowed to do."
      />

      {rows.length === 0 ? (
        <EmptyState className="mt-6" title="No people yet" description="Accounts appear here once they sign in." />
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {rows.map((p, i) => (
            <li
              key={p.id}
              className="editorial-enter flex flex-wrap items-center gap-3 py-3"
              style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
            >
              <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-muted">
                {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.display_name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.email ?? p.slug}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {p.roles.map((r) => ROLE_LABELS[r as AppRole] ?? r).join(", ") || "No role"}
              </span>
              <select
                disabled={!isEditor}
                value={p.roles[0] ?? ""}
                onChange={(e) => setRole(p.user_id, p.display_name, e.target.value as AppRole)}
                className="h-9 rounded-sm border border-input bg-background px-2 text-sm outline-none transition-colors focus-visible:border-secondary-accent disabled:opacity-60"
              >
                <option value="" disabled>
                  Assign role
                </option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10">
        <h2 className="kicker border-b border-border-strong pb-2">What each role can do</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r} className="premium-surface p-4">
              <p className="text-sm font-semibold">{ROLE_LABELS[r]}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {permByRole(r).length === 0 ? (
                  <li className="text-xs text-muted-foreground">Reading only.</li>
                ) : (
                  permByRole(r).map((perm) => (
                    <li
                      key={perm}
                      className="rounded-sm border border-border px-1.5 py-0.5 text-[0.68rem] text-muted-foreground"
                    >
                      {perm.replace(/_/g, " ")}
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Permissions are enforced on the server. Changing a role changes what that person can do
          everywhere, immediately.
        </p>
      </section>

      <div className="mt-8">
        <Btn variant="outline" onClick={() => void qc.invalidateQueries({ queryKey: ["admin"] })}>
          Refresh
        </Btn>
      </div>
    </div>
  );
}

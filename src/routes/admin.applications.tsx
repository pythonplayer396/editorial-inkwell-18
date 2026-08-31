import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, PageHeader, inputClass, textareaClass } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui-kit/States";
import { useCurrentUser } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/format";
import { applicationsQuery } from "@/lib/newsroom";
import { db } from "@/lib/queries";
import { recordAudit } from "@/lib/workflow";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsPage,
});

const STATUSES = ["pending", "under_review", "approved", "rejected", "more_info"] as const;
const LABELS: Record<string, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  more_info: "More information required",
};

function ApplicationsPage() {
  const qc = useQueryClient();
  const { userId, profile } = useCurrentUser();
  const q = useQuery(applicationsQuery);
  const [filter, setFilter] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const rows = (q.data ?? []).filter((a) => !filter || a.status === filter);

  const setStatus = async (id: string, status: string, name: string) => {
    try {
      const { error } = await db
        .from("journalist_applications")
        .update({
          status,
          decision_note: note || null,
          reviewed_by: userId ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
      await recordAudit(
        { userId, name: profile?.display_name ?? "An administrator" },
        `Application ${LABELS[status]}`,
        { type: "application", id, label: name },
        note || undefined,
      );
      setNote("");
      toast.success(`Application marked ${LABELS[status]?.toLowerCase()}`);
      void qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    } catch {
      toast.error("We couldn't update this application", { description: "Please try again." });
    }
  };

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Journalist applications"
        description="People asking to write for The Dispatch."
      />

      <div className="mt-5 max-w-56">
        <select className={inputClass} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All applications</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No applications"
          description="Applications sent from the Join The Dispatch page appear here."
        />
      ) : (
        <ul className="mt-6 space-y-2">
          {rows.map((a, i) => {
            const open = openId === a.id;
            return (
              <li
                key={a.id}
                className="premium-surface editorial-enter overflow-hidden"
                style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : a.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(a.coverage_areas ?? []).join(" · ") || "No areas listed"} · {timeAgo(a.created_at)}
                    </p>
                  </div>
                  <span className="rounded-sm border border-border px-2 py-0.5 text-xs">
                    {LABELS[a.status] ?? a.status}
                  </span>
                </button>

                {open ? (
                  <div className="animate-in fade-in slide-in-from-top-1 space-y-4 border-t border-border p-4 duration-200">
                    <Detail label="Bio" value={a.bio} />
                    <Detail label="Experience" value={a.experience} />
                    <Detail label="Previous publications" value={a.previous_publications} />
                    <Detail label="Portfolio" value={a.portfolio_links} />
                    <Detail label="Why they want to join" value={a.motivation} />
                    <textarea
                      rows={2}
                      className={textareaClass}
                      placeholder="Decision note (optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Btn onClick={() => setStatus(a.id, "approved", a.full_name)}>Approve</Btn>
                      <Btn variant="outline" onClick={() => setStatus(a.id, "under_review", a.full_name)}>
                        Mark under review
                      </Btn>
                      <Btn variant="outline" onClick={() => setStatus(a.id, "more_info", a.full_name)}>
                        Request more information
                      </Btn>
                      <Btn variant="danger" onClick={() => setStatus(a.id, "rejected", a.full_name)}>
                        Reject
                      </Btn>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Approving here records the decision. Grant writing access from Staff &amp; roles.
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{value}</p>
    </div>
  );
}

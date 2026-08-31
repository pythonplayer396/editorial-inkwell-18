import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader, inputClass } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui-kit/States";
import { formatDateTime } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { recentActivityQuery } from "@/lib/newsroom";

export const Route = createFileRoute("/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const t = useT();
  const q = useQuery(recentActivityQuery);
  const [term, setTerm] = useState("");
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");

  const rows = q.data ?? [];
  const actors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.actor_name).filter(Boolean))) as string[],
    [rows],
  );
  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))), [rows]);

  const filtered = rows.filter((r) => {
    if (actor && r.actor_name !== actor) return false;
    if (action && r.action !== action) return false;
    if (term) {
      const hay = `${r.actor_name ?? ""} ${r.action} ${r.entity_label ?? ""} ${r.detail ?? ""}`.toLowerCase();
      if (!hay.includes(term.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="editorial-enter px-5 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={t("nav.audit")}
        description="Every consequential action in the newsroom: who, what, and when."
      />

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <input
          className={inputClass}
          placeholder="Search activity"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <select className={inputClass} value={actor} onChange={(e) => setActor(e.target.value)}>
          <option value="">Everyone</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select className={inputClass} value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Every action</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Nothing recorded yet"
          description="Approvals, publications, role changes and settings updates all appear here."
        />
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {filtered.map((r, i) => (
            <li
              key={r.id}
              className="editorial-enter grid gap-1 py-2.5 text-sm sm:grid-cols-[minmax(0,10rem)_minmax(0,9rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
              style={{ animationDelay: `${Math.min(i, 12) * 20}ms` }}
            >
              <span className="truncate font-medium">{r.actor_name ?? "System"}</span>
              <span className="truncate text-muted-foreground">{r.action}</span>
              <span className="truncate">
                {r.entity_label ?? r.entity_type}
                {r.detail ? <span className="text-muted-foreground"> — {r.detail}</span> : null}
              </span>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDateTime(r.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

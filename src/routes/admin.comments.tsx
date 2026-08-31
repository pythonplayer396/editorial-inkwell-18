import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, PageHeader } from "@/components/admin/AdminUI";
import { EmptyState, StoryListSkeleton } from "@/components/ui-kit/States";
import { timeAgo } from "@/lib/format";
import { adminCommentsQuery, db } from "@/lib/queries";
import type { CommentStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/comments")({
  component: CommentsPage,
});

const TABS: Array<CommentStatus | "all"> = ["pending", "approved", "spam", "all"];
const LABEL: Record<CommentStatus | "all", string> = {
  pending: "Pending",
  approved: "Approved",
  spam: "Spam",
  all: "All",
};

function CommentsPage() {
  const qc = useQueryClient();
  const comments = useQuery(adminCommentsQuery);
  const [tab, setTab] = useState<CommentStatus | "all">("pending");

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CommentStatus }) => {
      const { error } = await db.from("comments").update({ status }).eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "comments"] });
    },
    onError: (e) => toast.error("Couldn't update", { description: (e as Error).message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("comments").delete().eq("id", id);
      if (error) throw new Error((error as { message: string }).message);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "comments"] });
      toast.success("Comment deleted");
    },
  });

  const rows = (comments.data ?? []).filter((c) => tab === "all" || c.status === tab);

  return (
    <div className="px-5 py-6 lg:px-8">
      <PageHeader
        title="Comments"
        description="Readers' replies. Nothing appears on the site until you approve it."
      />

      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const n = (comments.data ?? []).filter((c) => t === "all" || c.status === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                tab === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }`}
            >
              {LABEL[t]} ({n})
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {comments.isLoading ? (
          <StoryListSkeleton count={3} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nothing to moderate"
            description="When readers reply to a story, their comments queue up here."
          />
        ) : (
          rows.map((c) => (
            <article key={c.id} className="border border-border p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {c.author_name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {timeAgo(c.created_at)} · on {c.post?.title ?? "a story"}
                    </span>
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {c.status !== "approved" ? (
                    <Btn
                      className="h-8 px-2.5 text-xs"
                      onClick={() => setStatus.mutate({ id: c.id, status: "approved" })}
                    >
                      Approve
                    </Btn>
                  ) : null}
                  {c.status !== "spam" ? (
                    <Btn
                      variant="outline"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => setStatus.mutate({ id: c.id, status: "spam" })}
                    >
                      Spam
                    </Btn>
                  ) : null}
                  <Btn
                    variant="danger"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => remove.mutate(c.id)}
                  >
                    Delete
                  </Btn>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

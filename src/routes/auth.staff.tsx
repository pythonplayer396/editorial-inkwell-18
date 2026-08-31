import { createFileRoute } from "@tanstack/react-router";

import { AuthPortal } from "@/components/newsroom/AuthPortal";

export const Route = createFileRoute("/auth/staff")({
  head: () => ({
    meta: [
      { title: "Staff sign in — The Dispatch" },
      {
        name: "description",
        content: "Editors and reviewers sign in to the editorial desk.",
      },
      { property: "og:title", content: "Staff sign in — The Dispatch" },
      { property: "og:description", content: "Review, edit and publish submitted reporting." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthPortal
      active="/auth/staff"
      copy={{
        eyebrow: "Editorial desk",
        heading: "Everything waiting for review, in one queue.",
        blurb:
          "Read submissions in full, leave feedback for the journalist, keep private editorial notes, and approve, schedule or publish.",
        formTitle: "Sign in to the desk",
        formHint: "For editors, reviewers and moderators.",
        redirect: "/admin/submissions",
        footnote: "Staff access only.",
      }}
    />
  ),
});

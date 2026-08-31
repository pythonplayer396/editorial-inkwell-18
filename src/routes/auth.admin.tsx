import { createFileRoute } from "@tanstack/react-router";

import { AuthPortal } from "@/components/newsroom/AuthPortal";

export const Route = createFileRoute("/auth/admin")({
  head: () => ({
    meta: [
      { title: "Administration sign in — The Dispatch" },
      { name: "description", content: "Platform oversight, staff and permissions." },
      { property: "og:title", content: "Administration sign in — The Dispatch" },
      { property: "og:description", content: "Oversight, accountability and staff management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthPortal
      active="/auth/admin"
      copy={{
        eyebrow: "Administration",
        heading: "Know exactly who did what, and when.",
        blurb:
          "Oversight of every submission, approval, rejection and publication — with staff, roles and permissions in one place.",
        formTitle: "Sign in to administration",
        formHint: "Reserved for the publication owner and administrators.",
        redirect: "/admin/oversight",
        footnote: "Every action here is recorded in the audit log.",
      }}
    />
  ),
});

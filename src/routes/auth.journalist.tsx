import { createFileRoute } from "@tanstack/react-router";

import { AuthPortal } from "@/components/newsroom/AuthPortal";

export const Route = createFileRoute("/auth/journalist")({
  head: () => ({
    meta: [
      { title: "Journalist sign in — The Dispatch" },
      {
        name: "description",
        content: "Journalists sign in here to write, submit and track their stories.",
      },
      { property: "og:title", content: "Journalist sign in — The Dispatch" },
      { property: "og:description", content: "Write, submit and track your reporting." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthPortal
      active="/auth/journalist"
      copy={{
        eyebrow: "Journalists",
        heading: "Write the story. We'll handle the rest.",
        blurb:
          "Draft in plain language, add photographs with credits, and submit for editorial review. You'll see exactly where every story stands.",
        formTitle: "Sign in to your newsroom",
        formHint: "Use the account approved by the editorial desk.",
        redirect: "/newsroom",
        footnote: "Publishing access is granted after editorial approval.",
      }}
    />
  ),
});

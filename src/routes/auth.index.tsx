import { createFileRoute } from "@tanstack/react-router";

import { AuthPortal } from "@/components/newsroom/AuthPortal";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Reader account — The Dispatch" },
      {
        name: "description",
        content:
          "Sign in to bookmark stories, comment, and follow the journalists and sections you care about.",
      },
      { property: "og:title", content: "Reader account — The Dispatch" },
      { property: "og:description", content: "Bookmark, comment and follow on The Dispatch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthPortal
      active="/auth"
      copy={{
        eyebrow: "Readers",
        heading: "Keep the stories you care about close.",
        blurb:
          "A reader account lets you bookmark reporting, join the conversation in comments, and follow journalists and sections. Reading The Dispatch never requires an account.",
        formTitle: "Sign in to The Dispatch",
        formHint: "For readers. Bookmarks, comments and follows.",
        redirect: "/",
        allowSignUp: true,
        footnote: "Reading is always free and open.",
      }}
    />
  ),
});

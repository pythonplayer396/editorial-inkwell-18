import { createFileRoute } from "@tanstack/react-router";

import { AuthPortal } from "@/components/newsroom/AuthPortal";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Sign in — The Dispatch" },
      {
        name: "description",
        content:
          "One sign-in for The Dispatch: readers, journalists and editors all start here.",
      },
      { property: "og:title", content: "Sign in — The Dispatch" },
      { property: "og:description", content: "One account for reading, writing and editing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthPortal
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

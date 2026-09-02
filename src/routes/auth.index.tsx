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
        eyebrow: "The Dispatch",
        heading: "One account for reading and writing.",
        blurb:
          "Sign in to bookmark reporting, comment and follow journalists. Writing for The Dispatch starts here too — once your application is approved, this same account opens your newsroom.",
        formTitle: "Sign in to The Dispatch",
        formHint: "Readers, journalists and editors all sign in here.",
        redirect: "/",
        allowSignUp: true,
        footnote: "Reading is always free and open.",
      }}
    />
  ),
});

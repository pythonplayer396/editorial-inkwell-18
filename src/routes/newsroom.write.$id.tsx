import { createFileRoute } from "@tanstack/react-router";

import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const Route = createFileRoute("/newsroom/write/$id")({
  head: () => ({
    meta: [
      { title: "Write a story — The Dispatch" },
      { name: "description", content: "Draft, edit and submit your story to the editorial desk." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WritePage,
});

function WritePage() {
  const { id } = Route.useParams();
  return <ArticleEditor id={id} home="newsroom" />;
}

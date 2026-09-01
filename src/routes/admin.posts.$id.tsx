import { createFileRoute } from "@tanstack/react-router";

import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const Route = createFileRoute("/admin/posts/$id")({
  component: AdminEditorPage,
});

function AdminEditorPage() {
  const { id } = Route.useParams();
  return <ArticleEditor id={id} home="admin" />;
}

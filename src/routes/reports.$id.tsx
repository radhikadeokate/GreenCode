import { createFileRoute } from "@tanstack/react-router";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
export const Route = createFileRoute("/reports/$id")({
  validateSearch: (s: Record<string, unknown>): { print?: number } => ({ print: s.print ? 1 : undefined }),
  head: ({ params }) => ({ meta: [{ title: `Report ${params.id} — GreenCode` }, { name: "description", content: "Summarized efficiency and sustainability report." }, { property: "og:title", content: `Report ${params.id} — GreenCode` }, { property: "og:description", content: "Efficiency report." }] }),
  component: Page,
});
function Page() { const { id } = Route.useParams(); const { print } = Route.useSearch(); return <ReportDetailPage id={id} print={!!print} />; }

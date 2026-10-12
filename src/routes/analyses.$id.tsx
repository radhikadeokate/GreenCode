import { createFileRoute } from "@tanstack/react-router";
import { AnalysisDetailPage } from "@/pages/AnalysisDetailPage";
export const Route = createFileRoute("/analyses/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: string; with?: string } => ({ tab: typeof s.tab === "string" ? s.tab : undefined, with: typeof s.with === "string" ? s.with : undefined }),
  head: ({ params }) => ({ meta: [{ title: `Analysis ${params.id} — GreenCode` }, { name: "description", content: "Detailed analysis results: performance, runtime, quality, energy, hotspots." }, { property: "og:title", content: `Analysis ${params.id} — GreenCode` }, { property: "og:description", content: "Detailed analysis results." }] }),
  component: Page,
});
function Page() { const { id } = Route.useParams(); const s = Route.useSearch(); return <AnalysisDetailPage id={id} tab={s.tab} withId={s.with} />; }

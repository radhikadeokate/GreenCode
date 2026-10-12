import { createFileRoute } from "@tanstack/react-router";
import { NewAnalysisPage } from "@/pages/NewAnalysisPage";
export const Route = createFileRoute("/projects/new")({
  validateSearch: (s: Record<string, unknown>): { project?: string } => ({ project: typeof s.project === "string" ? s.project : undefined }),
  head: () => ({ meta: [{ title: "New Analysis — GreenCode" }, { name: "description", content: "Upload a Python or Java project and run an efficiency analysis." }, { property: "og:title", content: "New Analysis — GreenCode" }, { property: "og:description", content: "Upload and analyse a project." }] }),
  component: Page,
});
function Page() { const { project } = Route.useSearch(); return <NewAnalysisPage key={project ?? "new"} existingProjectId={project} />; }

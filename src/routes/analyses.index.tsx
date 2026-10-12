import { createFileRoute } from "@tanstack/react-router";
import { AnalysesPage } from "@/pages/AnalysesPage";
export const Route = createFileRoute("/analyses/")({
  head: () => ({ meta: [{ title: "Analyses — GreenCode" }, { name: "description", content: "Detailed technical results of individual analysis runs." }, { property: "og:title", content: "Analyses — GreenCode" }, { property: "og:description", content: "Detailed technical results of individual analysis runs." }] }),
  component: AnalysesPage,
});

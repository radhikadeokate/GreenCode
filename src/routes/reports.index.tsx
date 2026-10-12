import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/ReportsPage";
export const Route = createFileRoute("/reports/")({
  head: () => ({ meta: [{ title: "Reports — GreenCode" }, { name: "description", content: "Final summarized efficiency reports." }, { property: "og:title", content: "Reports — GreenCode" }, { property: "og:description", content: "Final summarized efficiency reports." }] }),
  component: ReportsPage,
});

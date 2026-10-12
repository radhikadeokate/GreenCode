import { createFileRoute } from "@tanstack/react-router";
import { RecommendationsPage } from "@/pages/RecommendationsPage";
export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — GreenCode" }, { name: "description", content: "Optimization suggestions from all analyses." }, { property: "og:title", content: "Recommendations — GreenCode" }, { property: "og:description", content: "Optimization suggestions from all analyses." }] }),
  component: RecommendationsPage,
});

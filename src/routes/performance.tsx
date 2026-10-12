import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/pages/PerformancePage";
export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — GreenCode" }, { name: "description", content: "Execution time, CPU and memory trends with baseline comparison." }, { property: "og:title", content: "Performance — GreenCode" }, { property: "og:description", content: "Execution time, CPU and memory trends with baseline comparison." }] }),
  component: PerformancePage,
});

import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — GreenCode" }, { name: "description", content: "Efficiency, Green Score, runtime trends and top hotspots across your projects." }, { property: "og:title", content: "Dashboard — GreenCode" }, { property: "og:description", content: "Software efficiency and sustainability overview." }] }),
  component: DashboardPage,
});

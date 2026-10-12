import { createFileRoute } from "@tanstack/react-router";
import { SustainabilityPage } from "@/pages/SustainabilityPage";
export const Route = createFileRoute("/sustainability")({
  head: () => ({ meta: [{ title: "Sustainability — GreenCode" }, { name: "description", content: "Estimated energy, Green Score and resource efficiency." }, { property: "og:title", content: "Sustainability — GreenCode" }, { property: "og:description", content: "Estimated energy, Green Score and resource efficiency." }] }),
  component: SustainabilityPage,
});

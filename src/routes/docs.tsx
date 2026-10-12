import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "@/pages/SettingsDocsPages";
export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — GreenCode" }, { name: "description", content: "How GreenCode measures and scores software." }, { property: "og:title", content: "Documentation — GreenCode" }, { property: "og:description", content: "How GreenCode measures and scores software." }] }),
  component: DocsPage,
});

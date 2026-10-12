import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsDocsPages";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — GreenCode" }, { name: "description", content: "Workspace, analysis defaults and backend connection." }, { property: "og:title", content: "Settings — GreenCode" }, { property: "og:description", content: "Workspace, analysis defaults and backend connection." }] }),
  component: SettingsPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/pages/ProjectsPage";
export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Projects — GreenCode" }, { name: "description", content: "Manage Python and Java projects and their efficiency results." }, { property: "og:title", content: "Projects — GreenCode" }, { property: "og:description", content: "Manage Python and Java projects and their efficiency results." }] }),
  component: ProjectsPage,
});

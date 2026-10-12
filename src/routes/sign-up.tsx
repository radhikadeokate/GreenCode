import { createFileRoute } from "@tanstack/react-router";
import { SignUpPage } from "@/pages/AuthPages";
export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Create account — GreenCode" }, { name: "description", content: "Create account to your GreenCode software efficiency workspace." }, { property: "og:title", content: "Create account — GreenCode" }, { property: "og:description", content: "Create account to your GreenCode workspace." }] }),
  component: SignUpPage,
});

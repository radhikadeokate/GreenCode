import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/AuthPages";
export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — GreenCode" }, { name: "description", content: "Reset password to your GreenCode software efficiency workspace." }, { property: "og:title", content: "Reset password — GreenCode" }, { property: "og:description", content: "Reset password to your GreenCode workspace." }] }),
  component: ResetPasswordPage,
});

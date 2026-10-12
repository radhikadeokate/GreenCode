import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/pages/AuthPages";
export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — GreenCode" }, { name: "description", content: "Forgot password to your GreenCode software efficiency workspace." }, { property: "og:title", content: "Forgot password — GreenCode" }, { property: "og:description", content: "Forgot password to your GreenCode workspace." }] }),
  component: ForgotPasswordPage,
});

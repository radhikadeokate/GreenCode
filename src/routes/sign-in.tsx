import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/pages/AuthPages";
export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign in — GreenCode" }, { name: "description", content: "Sign in to your GreenCode software efficiency workspace." }, { property: "og:title", content: "Sign in — GreenCode" }, { property: "og:description", content: "Sign in to your GreenCode workspace." }] }),
  component: SignInPage,
});

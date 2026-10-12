import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppLayout } from "@/layouts/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, themeInitScript } from "@/lib/theme";

const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "GreenCode",
      },
      {
        name: "description",
        content:
          "Software sustainability assessment and optimization platform.",
      },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/greencode-icon.png",
      },
    ],
  }),

  shellComponent: RootDocument,

  component: RootComponent,

  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>

        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);

  const router = useRouter();

  return (
    <RootDocument>
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                router.invalidate();
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>

            <Link
              to="/"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </RootDocument>
  );
}

function RootDocument({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />

        {children}

        <Scripts />
      </body>
    </html>
  );
}
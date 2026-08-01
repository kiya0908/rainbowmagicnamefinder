import type { Route } from "./+types/root";
import stylesUrl from "~/app.css?url";

import {
  isRouteErrorResponse,
  Outlet,
  useLocation,
  useRouteLoaderData,
} from "react-router";

import { getSiteOrigin } from "~/config/site";
import { isExplicitlyEnabled } from "~/config/third-party-services";
import { Document } from "~/features/document";

type RootLoaderData = {
  DOMAIN: string;
  CDN_URL: string;
  GOOGLE_ANALYTICS_ID: string;
  GOOGLE_ADS_ID: string;
  GOOGLE_CLIENT_ID: string;
  ANALYTICS_ENABLED: boolean;
  ADVERTISING_ENABLED: boolean;
};

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  context,
}: Route.LoaderArgs): Promise<RootLoaderData> => {
  const env =
    context.cloudflare?.env ??
    (typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {});

  return {
    DOMAIN: getSiteOrigin(env.DOMAIN),
    CDN_URL: env.CDN_URL ?? "",
    GOOGLE_ANALYTICS_ID: env.GOOGLE_ANALYTICS_ID ?? "",
    GOOGLE_ADS_ID: env.GOOGLE_ADS_ID ?? "",
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ?? "",
    ANALYTICS_ENABLED: isExplicitlyEnabled(env.ANALYTICS_ENABLED),
    ADVERTISING_ENABLED: isExplicitlyEnabled(env.ADVERTISING_ENABLED),
  };
};

export const Layout = ({ children }: React.PropsWithChildren) => {
  const rootData = useRouteLoaderData("root") as RootLoaderData | undefined;
  const { pathname } = useLocation();
  const lang = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";

  return (
    <Document
      lang={lang}
      theme="cupcake"
      DOMAIN={rootData?.DOMAIN}
      GOOGLE_ADS_ID={rootData?.GOOGLE_ADS_ID}
      GOOGLE_ANALYTICS_ID={rootData?.GOOGLE_ANALYTICS_ID}
      analyticsEnabled={rootData?.ANALYTICS_ENABLED ?? false}
      advertisingEnabled={rootData?.ADVERTISING_ENABLED ?? false}
    >
      {children}
    </Document>
  );
};

export default function App({}: Route.ComponentProps) {
  // Phase 1 fairy-finder: temporarily disable auth bootstrap and keep root minimal.
  // const setUser = useUser((state) => state.setUser);
  // const setCredits = useUser((state) => state.setCredits);
  //
  // useEffect(() => {
  //   const controller = new AbortController();
  //
  //   const bootstrapAuth = async () => {
  //     try {
  //       const res = await fetch("/api/auth", {
  //         cache: "no-store",
  //         credentials: "same-origin",
  //         signal: controller.signal,
  //       });
  //       if (!res.ok) {
  //         if (useUser.getState().user === void 0) setUser(null);
  //         return;
  //       }
  //
  //       const data = (await res.json()) as {
  //         profile: UserInfo | null;
  //         credits: number;
  //       };
  //
  //       const currentUser = useUser.getState().user;
  //       if (!data.profile && currentUser) return;
  //
  //       setUser(data.profile);
  //       setCredits(data.credits);
  //     } catch {
  //       if (controller.signal.aborted) return;
  //       if (useUser.getState().user === void 0) setUser(null);
  //     }
  //   };
  //
  //   void bootstrapAuth();
  //   return () => controller.abort();
  // }, [setCredits, setUser]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

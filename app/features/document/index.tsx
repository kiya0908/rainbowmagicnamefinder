import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { useEffect, useRef } from "react";

import {
  GoogleAnalytics,
  MicrosoftClarity,
  RouteAnalytics,
} from "~/components/analytics";
import { MICROSOFT_CLARITY_PROJECT_ID } from "~/lib/analytics/clarity";
import { scheduleNonCriticalTask } from "~/lib/performance/schedule-non-critical-task";

const GOOGLE_ADSENSE_SCRIPT_ID = "google-adsense-script";
const PAGEVIEW_SCRIPT_ID = "pageview-analytics-script";

interface DocumentProps {
  DOMAIN?: string;
  GOOGLE_ADS_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;
  lang?: string;
  theme?: string;
}
export function Document({
  lang = "en",
  theme = "light",
  children,
  DOMAIN,
  GOOGLE_ADS_ID,
  GOOGLE_ANALYTICS_ID,
}: React.PropsWithChildren<DocumentProps>) {
  const rootRef = useRef<HTMLHtmlElement>(null);
  const error = useRouteError();
  const googleAdsClientId = GOOGLE_ADS_ID
    ? GOOGLE_ADS_ID.startsWith("ca-")
      ? GOOGLE_ADS_ID
      : `ca-${GOOGLE_ADS_ID}`
    : "";

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let cancelScheduledTask: (() => void) | undefined;

    const injectScripts = () => {
      // Adsense
      if (
        googleAdsClientId &&
        !error &&
        !document.getElementById(GOOGLE_ADSENSE_SCRIPT_ID)
      ) {
        const adsScript = document.createElement("script");
        adsScript.id = GOOGLE_ADSENSE_SCRIPT_ID;
        adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsClientId}`;
        adsScript.async = true;
        adsScript.crossOrigin = "anonymous";

        document.head.appendChild(adsScript);
      }

      // Pageview
      if (DOMAIN && !document.getElementById(PAGEVIEW_SCRIPT_ID)) {
        const pScript = document.createElement("script");
        pScript.id = PAGEVIEW_SCRIPT_ID;
        pScript.src = "https://app.pageview.app/js/script.js";
        pScript.dataset.domain = new URL(DOMAIN).hostname;
        pScript.defer = true;

        document.head.appendChild(pScript);
      }
    };

    const scheduleInjection = () => {
      cancelScheduledTask = scheduleNonCriticalTask(injectScripts, {
        timeoutMs: 4000,
      });
    };

    if (document.readyState === "complete") {
      scheduleInjection();
    } else {
      window.addEventListener("load", scheduleInjection, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleInjection);
      cancelScheduledTask?.();
    };
  }, [googleAdsClientId, DOMAIN, error]);

  return (
    <html ref={rootRef} lang={lang} data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {googleAdsClientId && (
          <meta name="google-adsense-account" content={googleAdsClientId} />
        )}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <MicrosoftClarity projectId={MICROSOFT_CLARITY_PROJECT_ID} />
        <GoogleAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
        <RouteAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

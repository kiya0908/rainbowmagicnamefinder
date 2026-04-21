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
  RouteAnalytics,
} from "~/components/analytics";

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

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let adsScript: HTMLScriptElement;
    let pScript: HTMLScriptElement;
    let timeoutId: number | undefined;

    const injectScripts = () => {
      // Adsense
      if (GOOGLE_ADS_ID && !error) {
        adsScript = document.createElement("script");
        adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${GOOGLE_ADS_ID}`;
        adsScript.async = true;
        adsScript.crossOrigin = "anonymous";

        document.head.appendChild(adsScript);
      }

      // Plausible
      if (DOMAIN) {
        pScript = document.createElement("script");
        pScript.src = "https://app.pageview.app/js/script.js";
        pScript.dataset.domain = new URL(DOMAIN).hostname;
        pScript.defer = true;

        document.head.appendChild(pScript);
      }
    };

    const scheduleInjection = () => {
      timeoutId = window.setTimeout(injectScripts, 1500);
    };

    if (document.readyState === "complete") {
      scheduleInjection();
    } else {
      window.addEventListener("load", scheduleInjection, { once: true });
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("load", scheduleInjection);
      if (adsScript) adsScript.remove();
      if (pScript) pScript.remove();
    };
  }, [GOOGLE_ADS_ID, DOMAIN, error]);

  return (
    <html ref={rootRef} lang={lang} data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {GOOGLE_ADS_ID && (
          <meta name="google-adsense-account" content={`ca-${GOOGLE_ADS_ID}`} />
        )}
        <Meta />
        <Links />
        <GoogleAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
      </head>
      <body>
        {children}
        <RouteAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

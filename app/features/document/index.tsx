import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "react-router";
import { useEffect, useRef } from "react";

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
  const hasTrackedNavigationRef = useRef(false);
  const { pathname, search } = useLocation();
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

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!GOOGLE_ANALYTICS_ID) return;

    let gaScript: HTMLScriptElement | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const loadGA = () => {
      if (cancelled || window.gtag) return;

      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args);
      };

      window.gtag("js", new Date());
      window.gtag("config", GOOGLE_ANALYTICS_ID);

      gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
      document.head.appendChild(gaScript);
    };

    const scheduleLoad = () => {
      timeoutId = window.setTimeout(loadGA, 2500);
    };

    if (document.readyState === "complete") {
      scheduleLoad();
    } else {
      window.addEventListener("load", scheduleLoad, { once: true });
    }

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("load", scheduleLoad);
      if (gaScript) gaScript.remove();
    };
  }, [GOOGLE_ANALYTICS_ID]);

  useEffect(() => {
    if (!GOOGLE_ANALYTICS_ID) return;
    if (!window.gtag) return;

    if (!hasTrackedNavigationRef.current) {
      hasTrackedNavigationRef.current = true;
      return;
    }

    window.gtag("config", GOOGLE_ANALYTICS_ID, {
      page_path: `${pathname}${search}`,
    });
  }, [GOOGLE_ANALYTICS_ID, pathname, search]);

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
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

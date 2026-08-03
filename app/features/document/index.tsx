import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { useEffect, useRef, useState } from "react";

import {
  GoogleAnalytics,
  MicrosoftClarity,
  RouteAnalytics,
} from "~/components/analytics";
import { MICROSOFT_CLARITY_PROJECT_ID } from "~/lib/analytics/clarity";
import { scheduleNonCriticalTask } from "~/lib/performance/schedule-non-critical-task";
import { CookieConsentBanner } from "./cookie-consent-banner";
import {
  type CookieConsent,
  readCookieConsent,
} from "./cookie-consent";
import { ThirdPartyServicesProvider } from "./third-party-services";

const GOOGLE_ADSENSE_SCRIPT_ID = "google-adsense-script";
const PAGEVIEW_SCRIPT_ID = "pageview-analytics-script";

type AdSenseCommandQueue = Array<Record<string, unknown>> & {
  requestNonPersonalizedAds?: number;
};

interface DocumentProps {
  DOMAIN?: string;
  GOOGLE_ADS_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;
  lang?: string;
  theme?: string;
  analyticsEnabled?: boolean;
  advertisingEnabled?: boolean;
}
export function Document({
  lang = "en",
  theme = "light",
  children,
  DOMAIN,
  GOOGLE_ADS_ID,
  GOOGLE_ANALYTICS_ID,
  analyticsEnabled = false,
  advertisingEnabled = false,
}: React.PropsWithChildren<DocumentProps>) {
  const rootRef = useRef<HTMLHtmlElement>(null);
  const [consentStatus, setConsentStatus] = useState<CookieConsent | null>(null);
  const [isConsentReady, setIsConsentReady] = useState(false);
  const error = useRouteError();
  const googleAdsClientId = GOOGLE_ADS_ID
    ? GOOGLE_ADS_ID.startsWith("ca-")
      ? GOOGLE_ADS_ID
      : `ca-${GOOGLE_ADS_ID}`
    : "";
  const hasConsent = consentStatus === "accepted";
  const advertisingAllowed = advertisingEnabled && hasConsent;
  const analyticsAllowed = analyticsEnabled && hasConsent;

  useEffect(() => {
    setConsentStatus(readCookieConsent());
    setIsConsentReady(true);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!import.meta.env.PROD || (!advertisingAllowed && !analyticsAllowed)) return;

    let cancelScheduledTask: (() => void) | undefined;

    const injectScripts = () => {
      // Adsense
      if (
        advertisingAllowed &&
        googleAdsClientId &&
        !error &&
        !document.getElementById(GOOGLE_ADSENSE_SCRIPT_ID)
      ) {
        const adsWindow = window as Window & { adsbygoogle?: AdSenseCommandQueue };
        const adsbygoogle = adsWindow.adsbygoogle ?? [];

        // Keep advertising non-personalized because younger fans may use the public site.
        adsbygoogle.requestNonPersonalizedAds = 1;
        adsWindow.adsbygoogle = adsbygoogle;

        const adsScript = document.createElement("script");
        adsScript.id = GOOGLE_ADSENSE_SCRIPT_ID;
        adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsClientId}`;
        adsScript.async = true;
        adsScript.crossOrigin = "anonymous";

        document.head.appendChild(adsScript);
      }

      // Pageview
      if (analyticsAllowed && DOMAIN && !document.getElementById(PAGEVIEW_SCRIPT_ID)) {
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
  }, [advertisingAllowed, analyticsAllowed, googleAdsClientId, DOMAIN, error]);

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
        <ThirdPartyServicesProvider
          value={{
            advertisingEnabled: advertisingAllowed,
            analyticsEnabled: analyticsAllowed,
          }}
        >
          {children}
          {analyticsAllowed ? (
            <>
              <MicrosoftClarity projectId={MICROSOFT_CLARITY_PROJECT_ID} />
              <GoogleAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
              <RouteAnalytics measurementId={GOOGLE_ANALYTICS_ID} />
            </>
          ) : null}
          <ScrollRestoration />
          <Scripts />
        </ThirdPartyServicesProvider>
        <CookieConsentBanner
          consentStatus={consentStatus}
          isReady={isConsentReady}
          onConsentChange={setConsentStatus}
        />
      </body>
    </html>
  );
}

export type GtagCommand = (...args: unknown[]) => void;

interface PageviewOptions {
  measurementId: string;
  pageLocation: string;
  pagePath: string;
  pageTitle: string;
}

export const getGoogleAnalyticsScriptUrl = (measurementId: string) =>
  `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

export const getGoogleAnalyticsBootstrapScript = (measurementId: string) => {
  const serializedMeasurementId = JSON.stringify(measurementId);

  return [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){window.dataLayer.push(arguments);}",
    "window.gtag = window.gtag || gtag;",
    'gtag("js", new Date());',
    `gtag("config", ${serializedMeasurementId});`,
  ].join("\n");
};

export const pageview = (
  gtag: GtagCommand | undefined,
  { measurementId, pageLocation, pagePath, pageTitle }: PageviewOptions
) => {
  if (!gtag) return false;

  gtag("event", "page_view", {
    send_to: measurementId,
    page_location: pageLocation,
    page_path: pagePath,
    page_title: pageTitle,
  });

  return true;
};

export const trackEvent = (
  gtag: GtagCommand | undefined,
  name: string,
  params: Record<string, unknown> = {}
) => {
  if (!gtag) return false;

  gtag("event", name, params);
  return true;
};

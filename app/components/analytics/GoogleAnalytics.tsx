import {
  getGoogleAnalyticsBootstrapScript,
  getGoogleAnalyticsScriptUrl,
} from "~/lib/analytics/gtag";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!import.meta.env.PROD) return null;
  if (!measurementId) return null;

  return (
    <>
      <script async src={getGoogleAnalyticsScriptUrl(measurementId)} />
      <script
        dangerouslySetInnerHTML={{
          __html: getGoogleAnalyticsBootstrapScript(measurementId),
        }}
      />
    </>
  );
}

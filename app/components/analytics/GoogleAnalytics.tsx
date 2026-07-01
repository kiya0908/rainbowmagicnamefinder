import { useEffect } from "react";

import {
  GOOGLE_ANALYTICS_BOOTSTRAP_SCRIPT_ID,
  GOOGLE_ANALYTICS_SCRIPT_ID,
  getGoogleAnalyticsBootstrapScript,
  getGoogleAnalyticsScriptUrl,
} from "~/lib/analytics/gtag";
import { scheduleNonCriticalTask } from "~/lib/performance/schedule-non-critical-task";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!import.meta.env.PROD || !measurementId) return;

    let cancelScheduledTask: (() => void) | undefined;

    const loadAnalytics = () => {
      if (!document.getElementById(GOOGLE_ANALYTICS_BOOTSTRAP_SCRIPT_ID)) {
        const bootstrapScript = document.createElement("script");
        bootstrapScript.id = GOOGLE_ANALYTICS_BOOTSTRAP_SCRIPT_ID;
        bootstrapScript.textContent =
          getGoogleAnalyticsBootstrapScript(measurementId);
        document.head.appendChild(bootstrapScript);
      }

      if (!document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) {
        const analyticsScript = document.createElement("script");
        analyticsScript.id = GOOGLE_ANALYTICS_SCRIPT_ID;
        analyticsScript.async = true;
        analyticsScript.src = getGoogleAnalyticsScriptUrl(measurementId);
        document.head.appendChild(analyticsScript);
      }
    };

    const scheduleLoad = () => {
      cancelScheduledTask = scheduleNonCriticalTask(loadAnalytics, {
        timeoutMs: 3000,
      });
    };

    if (document.readyState === "complete") {
      scheduleLoad();
    } else {
      window.addEventListener("load", scheduleLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleLoad);
      cancelScheduledTask?.();
    };
  }, [measurementId]);

  return null;
}

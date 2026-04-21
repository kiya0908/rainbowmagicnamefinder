import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

import { pageview } from "~/lib/analytics/gtag";

interface RouteAnalyticsProps {
  measurementId?: string;
}

export function RouteAnalytics({ measurementId }: RouteAnalyticsProps) {
  const hasTrackedInitialRouteRef = useRef(false);
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!measurementId) return;

    if (!hasTrackedInitialRouteRef.current) {
      hasTrackedInitialRouteRef.current = true;
      return;
    }

    void pageview(window.gtag, {
      measurementId,
      pageLocation: window.location.href,
      pagePath: `${pathname}${search}`,
      pageTitle: document.title,
    });
  }, [measurementId, pathname, search]);

  return null;
}

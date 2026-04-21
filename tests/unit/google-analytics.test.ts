import test from "node:test";
import assert from "node:assert/strict";

import {
  getGoogleAnalyticsScriptUrl,
  getGoogleAnalyticsBootstrapScript,
  pageview,
  trackEvent,
} from "../../app/lib/analytics/gtag.js";

const MEASUREMENT_ID = "G-WXB3YC322J";

test("Google Analytics: gtag script URL targets the configured measurement id", () => {
  assert.equal(
    getGoogleAnalyticsScriptUrl(MEASUREMENT_ID),
    `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  );
});

test("Google Analytics: bootstrap script initializes dataLayer and config", () => {
  const script = getGoogleAnalyticsBootstrapScript(MEASUREMENT_ID);

  assert.match(script, /window\.dataLayer = window\.dataLayer \|\| \[\];/);
  assert.match(script, /window\.gtag = window\.gtag \|\| gtag;/);
  assert.match(script, /gtag\("js", new Date\(\)\);/);
  assert.match(
    script,
    new RegExp(`gtag\\("config", "${MEASUREMENT_ID}"\\);`)
  );
});

test("Google Analytics: pageview emits a page_view event with explicit SPA metadata", () => {
  const calls: unknown[][] = [];

  const tracked = pageview(
    (...args: unknown[]) => calls.push(args),
    {
      measurementId: MEASUREMENT_ID,
      pageLocation: "https://rainbowmagicfairyname.online/blog?ref=test",
      pagePath: "/blog?ref=test",
      pageTitle: "Fairy Blog",
    }
  );

  assert.equal(tracked, true);
  assert.deepEqual(calls, [
    [
      "event",
      "page_view",
      {
        send_to: MEASUREMENT_ID,
        page_location: "https://rainbowmagicfairyname.online/blog?ref=test",
        page_path: "/blog?ref=test",
        page_title: "Fairy Blog",
      },
    ],
  ]);
});

test("Google Analytics: trackEvent is a safe no-op when gtag is unavailable", () => {
  const tracked = trackEvent(undefined, "generate_fairy_name", {
    locale: "en",
  });

  assert.equal(tracked, false);
});

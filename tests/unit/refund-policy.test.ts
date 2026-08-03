import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) => readFile(path, "utf8");

test("Refund Policy: current transaction boundaries and support paths stay explicit", async () => {
  const [policy, route, llms, sitemap] = await Promise.all([
    readSource("app/routes/_legal/refund/content.md"),
    readSource("app/routes/_legal/refund/route.tsx"),
    readSource("app/features/meta/llms.ts"),
    readSource("app/routes/_meta/[sitemap.xml].tsx"),
  ]);

  assert.match(policy, /Last updated: August 03, 2026/);
  assert.match(policy, /does not currently sell or directly process payments/i);
  assert.match(policy, /cannot issue a refund/i);
  assert.match(policy, /Amazon\.co\.uk/);
  assert.match(policy, /affiliate commission/i);
  assert.match(policy, /Google AdSense/);
  assert.match(policy, /Adsterra/);
  assert.match(policy, /contact your bank, card issuer, or payment provider promptly/i);
  assert.match(policy, /Do not send[^.]*full card number[^.]*CVV[^.]*PIN/i);
  assert.match(policy, /does not pause or extend any dispute deadline/i);
  assert.doesNotMatch(policy, /within 24 hours|within 48 hours/i);

  assert.match(route, /has no site purchases to refund/);
  assert.doesNotMatch(route, /eligibility criteria|request timelines|refund processing details/);
  assert.match(llms, /third-party merchant/i);
  assert.match(
    sitemap,
    /path: "\/legal\/refund", priority: "0\.4", lastmod: "2026-08-03"/
  );
});

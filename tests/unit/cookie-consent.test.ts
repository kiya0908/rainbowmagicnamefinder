import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  COOKIE_CONSENT_STORAGE_KEY,
  parseCookieConsent,
} from "../../app/features/document/cookie-consent.js";

const readSource = (path: string) => readFileSync(path, "utf8");

test("Cookie consent: only explicit persisted choices are accepted", () => {
  assert.equal(parseCookieConsent("accepted"), "accepted");
  assert.equal(parseCookieConsent("rejected"), "rejected");
  assert.equal(parseCookieConsent(null), null);
  assert.equal(parseCookieConsent("1"), null);
  assert.equal(parseCookieConsent("unknown"), null);
  assert.equal(COOKIE_CONSENT_STORAGE_KEY, "cookie_consent_v1");
});

test("Cookie consent: root document gates every non-essential service", () => {
  const documentSource = readSource("app/features/document/index.tsx");

  assert.match(documentSource, /consentStatus === "accepted"/);
  assert.match(
    documentSource,
    /advertisingAllowed\s*=\s*advertisingEnabled\s*&&\s*hasConsent/
  );
  assert.match(
    documentSource,
    /analyticsAllowed\s*=\s*analyticsEnabled\s*&&\s*hasConsent/
  );
  assert.match(documentSource, /<CookieConsentBanner/);
  assert.match(
    documentSource,
    /advertisingEnabled:\s*advertisingAllowed/
  );
  assert.match(documentSource, /analyticsEnabled:\s*analyticsAllowed/);
});

test("Cookie consent: banner offers accept, reject and reopening controls", () => {
  const bannerSource = readSource(
    "app/features/document/cookie-consent-banner.tsx"
  );

  assert.match(bannerSource, /Reject non-essential/);
  assert.match(bannerSource, /\n\s*Accept\n/);
  assert.match(bannerSource, /Cookie settings/);
  assert.match(bannerSource, /window\.location\.reload\(\)/);
  assert.doesNotMatch(bannerSource, /designed for children/i);
  assert.doesNotMatch(bannerSource, /never track/i);
});

test("Cookie consent: policy documents the stored choice and script gate", () => {
  const policy = readSource("app/routes/_legal/cookie/content.md");

  assert.match(policy, /`cookie_consent_v1`/);
  assert.match(policy, /Accept/);
  assert.match(policy, /Reject non-essential/);
  assert.match(policy, /does not load/i);
});

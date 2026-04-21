import test from "node:test";
import assert from "node:assert/strict";

import "./fairy-image.test.js";
import "./google-analytics.test.js";
import { SITE_ORIGIN, getSiteOrigin, toSiteUrl } from "../../app/config/site.js";
import { CREDITS_PRODUCT } from "../../app/.server/constants/product.js";
import { shouldRequireBaseAuthFromEnv } from "../../app/.server/libs/base-auth.js";
import {
  isDuplicateOrderCompletionError,
  isIgnorableWebhookPaymentError,
} from "../../app/.server/services/order-errors.js";

test("Stage 6: legacy credit product constant remains available", () => {
  assert.ok(CREDITS_PRODUCT.product_id);
  assert.equal(CREDITS_PRODUCT.type, "once");
  assert.ok(CREDITS_PRODUCT.credits > 0);
});

test("Base auth: production always requires login even with bypass enabled", () => {
  const shouldRequire = shouldRequireBaseAuthFromEnv({
    isProduction: true,
    bypassBaseAuthInDev: "true",
  });

  assert.equal(shouldRequire, true);
});

test("Base auth: development allows anonymous access when bypass is enabled", () => {
  const shouldRequire = shouldRequireBaseAuthFromEnv({
    isProduction: false,
    bypassBaseAuthInDev: "true",
  });

  assert.equal(shouldRequire, false);
});

test("Base auth: development still requires login without bypass", () => {
  assert.equal(
    shouldRequireBaseAuthFromEnv({
      isProduction: false,
      bypassBaseAuthInDev: "false",
    }),
    true
  );

  assert.equal(
    shouldRequireBaseAuthFromEnv({
      isProduction: false,
    }),
    true
  );
});

test("Payment callback: duplicate completion errors are treated as success-compatible", () => {
  assert.equal(isDuplicateOrderCompletionError("Transaction is completed"), true);
  assert.equal(isDuplicateOrderCompletionError("Transaction is processing"), true);
  assert.equal(isDuplicateOrderCompletionError("Transaction is refunded"), false);
});

test("Payment webhook: ignorable errors exclude signature failures", () => {
  assert.equal(isIgnorableWebhookPaymentError("Transaction is completed"), true);
  assert.equal(isIgnorableWebhookPaymentError("Invalid transaction"), true);
  assert.equal(isIgnorableWebhookPaymentError("Invalid Signature"), false);
});

test("SEO site origin: localhost-like domains always fall back to the production origin", () => {
  assert.equal(getSiteOrigin(), SITE_ORIGIN);
  assert.equal(getSiteOrigin("http://localhost:5173"), SITE_ORIGIN);
  assert.equal(getSiteOrigin("http://127.0.0.1:8788"), SITE_ORIGIN);
  assert.equal(getSiteOrigin("https://rainbowmagic.preview.pages.dev"), SITE_ORIGIN);
  assert.equal(getSiteOrigin("https://feature-preview.example.com"), SITE_ORIGIN);
});

test("SEO site url: absolute URLs always use the production origin", () => {
  assert.equal(toSiteUrl("/blog", "http://localhost:5173"), `${SITE_ORIGIN}/blog`);
  assert.equal(
    toSiteUrl("/legal/privacy", "https://preview.rainbowmagicfairyname.online"),
    `${SITE_ORIGIN}/legal/privacy`
  );
  assert.equal(toSiteUrl("/", "https://www.rainbowmagicfairyname.online"), `${SITE_ORIGIN}/`);
});

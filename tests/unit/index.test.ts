import test from "node:test";
import assert from "node:assert/strict";

import {
  canUseRequestedIntensity,
  deriveTranslationEntitlement,
} from "../../app/features/linkedin-translator/access.js";
import {
  buildTranslationPromptSet,
  calculateTranslationCredits,
  estimateTranslationCreditsUpperBound,
  extractJsonTranslation,
  sanitizeTranslationOutput,
} from "../../app/features/linkedin-translator/config.js";
import {
  LINKEDIN_TRANSLATOR_PRICING_CARDS,
  LINKEDIN_TRANSLATOR_PRO_PACK,
} from "../../app/features/linkedin-translator/pricing.js";
import { shouldRequireBaseAuthFromEnv } from "../../app/.server/libs/base-auth.js";
import {
  isDuplicateOrderCompletionError,
  isIgnorableWebhookPaymentError,
} from "../../app/.server/services/order-errors.js";

test("Stage 3: prompt builder keeps mode-specific intent and hard constraints", () => {
  const prompt = buildTranslationPromptSet(
    "human-to-linkedin",
    "extreme",
    "We shipped a messy rollout and learned a lot."
  );

  assert.match(prompt.systemPrompt, /high-conviction LinkedIn post/i);
  assert.match(prompt.systemPrompt, /Never invent metrics/i);
  assert.match(prompt.userPrompt, /<source>/);
  assert.ok(prompt.outputMaxChars >= 900);
});

test("Stage 3: JSON structured output can be extracted and sanitized", () => {
  const raw = "```json\n{\"translation\":\"Translation: Clear rewrite\\n\\n\\nwith spacing\"}\n```";

  assert.equal(extractJsonTranslation('{"translation":"Hello"}'), "Hello");
  assert.equal(sanitizeTranslationOutput(raw, 400), "Clear rewrite\n\nwith spacing");
});

test("Stage 3: small successful responses still charge a minimum of one credit", () => {
  assert.equal(
    calculateTranslationCredits({
      promptTokens: 300,
      completionTokens: 250,
      totalTokens: 550,
    }),
    1
  );
});

test("Stage 3: larger responses can scale above the minimum credit floor", () => {
  assert.equal(
    calculateTranslationCredits({
      promptTokens: 2_000_000,
      completionTokens: 1_000_000,
      totalTokens: 3_000_000,
    }),
    186
  );
});

test("Stage 3: estimated upper-bound credits stay positive for paid translations", () => {
  assert.ok(
    estimateTranslationCreditsUpperBound(
      "linkedin-to-human",
      "standard",
      "Thrilled to align our cross-functional roadmap and unlock scalable synergies."
    ) >= 1
  );
});

test("Stage 4: signed-in users without paid history receive trial access instead of pro", () => {
  const entitlement = deriveTranslationEntitlement({
    isAuthenticated: true,
    credits: 0,
    dailyUsed: 2,
    hasPaidHistory: false,
  });

  assert.equal(entitlement.state, "trial");
  assert.equal(entitlement.canUseExtreme, false);
  assert.equal(entitlement.remainingDaily, 3);
  assert.equal(canUseRequestedIntensity(entitlement, "standard"), true);
  assert.equal(canUseRequestedIntensity(entitlement, "extreme"), false);
});

test("Stage 4: users with depleted paid balance fall back to expired access", () => {
  const entitlement = deriveTranslationEntitlement({
    isAuthenticated: true,
    credits: 0,
    dailyUsed: 1,
    hasPaidHistory: true,
  });

  assert.equal(entitlement.state, "expired");
  assert.equal(entitlement.canTranslate, true);
  assert.equal(entitlement.remainingDaily, 4);
});

test("Stage 4: users with credits are treated as pro and bypass daily quota", () => {
  const entitlement = deriveTranslationEntitlement({
    isAuthenticated: true,
    credits: 42,
    dailyUsed: 99,
    hasPaidHistory: true,
  });

  assert.equal(entitlement.state, "pro");
  assert.equal(entitlement.dailyLimit, null);
  assert.equal(entitlement.remainingDaily, null);
  assert.equal(entitlement.canUseExtreme, true);
});

test("Stage 2: pricing cards stay aligned with the actual Pro credit pack", () => {
  const proCard = LINKEDIN_TRANSLATOR_PRICING_CARDS.find(
    (card) => card.id === LINKEDIN_TRANSLATOR_PRO_PACK.id
  );

  assert.ok(proCard);
  assert.equal(
    "productId" in proCard ? proCard.productId : null,
    LINKEDIN_TRANSLATOR_PRO_PACK.productId
  );
  assert.match(proCard.description, /usage-based billing/i);
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

import { env } from "cloudflare:workers";
import { nanoid } from "nanoid";
import { createCookie } from "react-router";

import { getSessionHandler } from "~/.server/libs/session";
import { listCreditRecordsByUser } from "~/.server/model/credit_record";
import { getUserCredits, consumptionsCredits } from "~/.server/services/credits";

import {
  canUseRequestedIntensity,
  deriveTranslationEntitlement,
  type TranslationEntitlement,
} from "~/features/linkedin-translator/access";
import {
  DEFAULT_EXPIRED_DAILY_TRANSLATIONS,
  DEFAULT_FREE_DAILY_TRANSLATIONS,
  DEFAULT_TRIAL_DAILY_TRANSLATIONS,
  type TranslationIntensity,
  type TranslationMode,
} from "~/features/linkedin-translator/config";

import type { User } from "~/.server/libs/db";

interface TranslationDailyLimits {
  free: number;
  trial: number;
  expired: number;
}

interface QuotaRecord {
  used: number;
}

export interface LinkedinTranslationAccessContext {
  entitlement: TranslationEntitlement;
  user: User | null;
  guestId: string | null;
  cookieHeader?: string;
  subjectKey: string;
  limits: TranslationDailyLimits;
}

const sessionSecret = env.SESSION_SECRET ?? "local-dev-session-secret";

const getGuestCookie = () =>
  createCookie("linkedin_translator_guest", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    secrets: [sessionSecret],
  });

const getLimits = (): TranslationDailyLimits => {
  return {
    // Guest free quota is intentionally disabled; free usage requires sign-in.
    free: DEFAULT_FREE_DAILY_TRANSLATIONS,
    trial: DEFAULT_TRIAL_DAILY_TRANSLATIONS,
    expired: DEFAULT_EXPIRED_DAILY_TRANSLATIONS,
  };
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getQuotaKey = (subjectKey: string, dayKey: string) =>
  `linkedin-translator:quota:${dayKey}:${subjectKey}`;

const readQuotaUsed = async (subjectKey: string) => {
  const raw = await env.KV.get(getQuotaKey(subjectKey, getTodayKey()), "json");
  const parsed = raw as QuotaRecord | null;
  return Math.max(0, Math.floor(parsed?.used ?? 0));
};

const writeQuotaUsed = async (subjectKey: string, used: number) => {
  await env.KV.put(
    getQuotaKey(subjectKey, getTodayKey()),
    JSON.stringify({ used: Math.max(0, Math.floor(used)) }),
    { expirationTtl: 60 * 60 * 24 * 2 }
  );
};

const buildEntitlement = (options: {
  user: User | null;
  credits: number;
  hasPaidHistory: boolean;
  dailyUsed: number;
  limits: TranslationDailyLimits;
}) =>
  deriveTranslationEntitlement({
    isAuthenticated: Boolean(options.user),
    credits: options.credits,
    dailyUsed: options.dailyUsed,
    hasPaidHistory: options.hasPaidHistory,
    freeDailyLimit: options.limits.free,
    trialDailyLimit: options.limits.trial,
    expiredDailyLimit: options.limits.expired,
  });

export const resolveLinkedinTranslationAccess = async (
  request: Request
): Promise<LinkedinTranslationAccessContext> => {
  const limits = getLimits();
  const [session] = await getSessionHandler(request);
  const user = session.get("user") ?? null;
  let credits = 0;
  let hasPaidHistory = false;

  if (user) {
    const [{ balance }, creditRecords] = await Promise.all([
      getUserCredits(user),
      listCreditRecordsByUser(user.id),
    ]);

    credits = Math.max(0, Math.floor(balance));
    hasPaidHistory = creditRecords.some(
      (record) =>
        record.trans_type === "purchase" || record.trans_type === "subscription"
    );
  }

  let guestId: string | null = null;
  let cookieHeader: string | undefined;

  if (!user) {
    const guestCookie = getGuestCookie();
    const parsedGuestId = await guestCookie.parse(request.headers.get("Cookie"));
    guestId =
      typeof parsedGuestId === "string" && parsedGuestId.trim()
        ? parsedGuestId
        : nanoid(16);

    if (!parsedGuestId) {
      cookieHeader = await guestCookie.serialize(guestId);
    }
  }

  const subjectKey = user ? `user:${user.id}` : `guest:${guestId}`;
  const dailyUsed = await readQuotaUsed(subjectKey);

  return {
    entitlement: buildEntitlement({
      user,
      credits,
      hasPaidHistory,
      dailyUsed,
      limits,
    }),
    user,
    guestId,
    cookieHeader,
    subjectKey,
    limits,
  };
};

export const assertLinkedinTranslationAllowed = (
  access: LinkedinTranslationAccessContext,
  intensity: TranslationIntensity
) => {
  if (!canUseRequestedIntensity(access.entitlement, intensity)) {
    throw new Response("Extreme mode requires paid credits.", { status: 402 });
  }

  if (!access.entitlement.canTranslate) {
    throw new Response("Daily quota reached. Upgrade to continue.", {
      status: 402,
    });
  }
};

export const settleLinkedinTranslationUsage = async (
  access: LinkedinTranslationAccessContext,
  payload: {
    creditsToCharge: number;
    requestId: string;
    mode: TranslationMode;
    intensity: TranslationIntensity;
  }
) => {
  const nextDailyUsed =
    access.entitlement.state === "pro"
      ? access.entitlement.dailyUsed
      : access.entitlement.dailyUsed + 1;

  if (access.entitlement.state === "pro") {
    if (!access.user) {
      throw new Error("Authenticated user is required for paid usage.");
    }

    const chargedCredits = Math.max(1, payload.creditsToCharge);
    await consumptionsCredits(access.user, {
      credits: chargedCredits,
      source_type: "linkedin_translation",
      source_id: payload.requestId,
      reason: `${payload.mode}:${payload.intensity}`,
    });

    return buildEntitlement({
      user: access.user,
      credits: Math.max(0, access.entitlement.credits - chargedCredits),
      hasPaidHistory: true,
      dailyUsed: nextDailyUsed,
      limits: access.limits,
    });
  }

  await writeQuotaUsed(access.subjectKey, nextDailyUsed);

  return buildEntitlement({
    user: access.user,
    credits: access.entitlement.credits,
    hasPaidHistory: access.entitlement.hasPaidHistory,
    dailyUsed: nextDailyUsed,
    limits: access.limits,
  });
};

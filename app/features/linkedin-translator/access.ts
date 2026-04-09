import {
  DEFAULT_EXPIRED_DAILY_TRANSLATIONS,
  DEFAULT_FREE_DAILY_TRANSLATIONS,
  DEFAULT_TRIAL_DAILY_TRANSLATIONS,
  type TranslationIntensity,
} from "./config.js";

export type TranslationEntitlementState =
  | "free"
  | "trial"
  | "pro"
  | "expired";

export interface TranslationEntitlement {
  state: TranslationEntitlementState;
  credits: number;
  hasPaidHistory: boolean;
  isAuthenticated: boolean;
  canTranslate: boolean;
  canUseExtreme: boolean;
  dailyLimit: number | null;
  dailyUsed: number;
  remainingDaily: number | null;
  helperText: string;
}

export interface DeriveTranslationEntitlementOptions {
  isAuthenticated: boolean;
  credits: number;
  dailyUsed: number;
  hasPaidHistory?: boolean;
  freeDailyLimit?: number;
  trialDailyLimit?: number;
  expiredDailyLimit?: number;
}

const buildHelperText = (
  state: TranslationEntitlementState,
  remainingDaily: number | null,
  credits: number
) => {
  if (state === "pro") {
    return `Credits available: ${credits}. Extreme mode is unlocked and usage is billed from your balance.`;
  }

  if (state === "trial") {
    return `Signed-in free quota: ${remainingDaily ?? 0} translations left today before you need paid credits.`;
  }

  if (state === "expired") {
    return remainingDaily && remainingDaily > 0
      ? `Paid credits are currently depleted. You still have ${remainingDaily} free daily translations left.`
      : "Paid credits are depleted and today's free backup quota is used up. Recharge to continue.";
  }

  return "Sign in to unlock your starter credits and 5 free daily translations.";
};

export const deriveTranslationEntitlement = ({
  isAuthenticated,
  credits,
  dailyUsed,
  hasPaidHistory = false,
  freeDailyLimit = DEFAULT_FREE_DAILY_TRANSLATIONS,
  trialDailyLimit = DEFAULT_TRIAL_DAILY_TRANSLATIONS,
  expiredDailyLimit = DEFAULT_EXPIRED_DAILY_TRANSLATIONS,
}: DeriveTranslationEntitlementOptions): TranslationEntitlement => {
  const safeCredits = Math.max(0, Math.floor(credits));
  const safeDailyUsed = Math.max(0, Math.floor(dailyUsed));

  const state: TranslationEntitlementState =
    safeCredits > 0
      ? "pro"
      : hasPaidHistory
        ? "expired"
        : isAuthenticated
          ? "trial"
          : "free";

  const dailyLimit =
    state === "pro"
      ? null
      : state === "trial"
        ? trialDailyLimit
        : state === "expired"
          ? expiredDailyLimit
          : freeDailyLimit;

  const remainingDaily =
    dailyLimit === null ? null : Math.max(0, dailyLimit - safeDailyUsed);

  return {
    state,
    credits: safeCredits,
    hasPaidHistory,
    isAuthenticated,
    canTranslate: state === "pro" || (remainingDaily ?? 0) > 0,
    canUseExtreme: state === "pro",
    dailyLimit,
    dailyUsed: safeDailyUsed,
    remainingDaily,
    helperText: buildHelperText(state, remainingDaily, safeCredits),
  };
};

export const canUseRequestedIntensity = (
  entitlement: TranslationEntitlement,
  intensity: TranslationIntensity
) => intensity !== "extreme" || entitlement.canUseExtreme;

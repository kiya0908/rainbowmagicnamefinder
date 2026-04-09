// Subscription plans and Creem product bindings.
export interface PLAN {
  id: string;
  popular: boolean;
  product_id: { monthly: string; yearly: string } | null;
  price: { monthly: number; yearly: number };
  i18n: {
    name: string;
    description: string;
    yearlyDescription?: string;
    features: string;
    creditsLine?: string;
    billingLabel?: string;
  };
  name: string;
  description: string;
  yearly_description?: string;
  feature_description: string[];
  limit: {
    adblock: boolean;
    watermarks: boolean;
    highResolution: boolean;
    fullStyles: boolean;
    credits: { monthly: number; yearly: number };
    private: boolean;
    features: boolean;
  };
}

// Creem test product IDs.
export const CREEM_TEST_PRODUCT_IDS = {
  credits: "prod_3CJ451WCJzi8jjfvKu4vKy",
  linkedinCredit200: "prod_3CJ451WCJzi8jjfvKu4vKy",
  linkedinCredit500: "prod_4YSZQ9HNenZIzUUK9RDXQd",
  basicMonthly: "prod_7YjALT2jGck6urOhF5c9eY",
  proMonthly: "prod_7fd4FH33suoTnUkg9uN0xt",
  proYearly: "prod_6Fb51lq3LL7rRFtUuyuxar",
} as const;

// Creem live product IDs.
export const CREEM_LIVE_PRODUCT_IDS = {
  credits: "prod_4n1E0Ar5DuQzWVMZmqWW8q",
  linkedinCredit200: "prod_4n1E0Ar5DuQzWVMZmqWW8q",
  linkedinCredit500: "prod_xblzifWFyHWCvOaGlvek8",
  basicMonthly: "prod_68vCzqxlaaGpHVRUwaC1Ke",
  proMonthly: "prod_2n5YxziKFezbUrhzX6dKxn",
  proYearly: "prod_3LgwlSFZqQeZiKM3DaMlZ6",
} as const;

const isProdRuntime =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.PROD);

// Switch product IDs automatically by runtime mode.
export const CREEM_ACTIVE_PRODUCT_IDS = isProdRuntime
  ? CREEM_LIVE_PRODUCT_IDS
  : CREEM_TEST_PRODUCT_IDS;

export const FREE_PLAN: PLAN = {
  id: "free",
  popular: false,
  product_id: null,
  price: { monthly: 0, yearly: 0 },
  i18n: {
    name: "pricing.starter",
    description: "pricing.starterDescription",
    features: "pricing.starterFeatures",
  },
  name: "Starter",
  description:
    "Sign in to activate 5 starter credits and get 5 free credits refreshed daily.",
  feature_description: [
    "5 starter credits after sign-in",
    "5 free daily credits after sign-in",
    "Basic generation quality",
    "Text-to-Image & Image-to-Image",
    "Watermark included",
  ],
  limit: {
    adblock: false,
    watermarks: true,
    highResolution: false,
    fullStyles: false,
    credits: { monthly: 5, yearly: 5 },
    private: false,
    features: false,
  },
};

export const BASIC_PLAN: PLAN = {
  id: "basic",
  popular: false,
  price: { monthly: 9, yearly: 0 },
  i18n: {
    name: "pricing.basic",
    description: "pricing.basicDescription",
    features: "pricing.basicFeatures",
    billingLabel: "pricing.monthlyPlanLabel",
  },
  product_id: {
    monthly: CREEM_ACTIVE_PRODUCT_IDS.basicMonthly,
    yearly: "",
  },
  name: "Basic",
  description:
    "Perfect for beginners and casual creators who want to explore AI image generation.",
  feature_description: [
    "500 Credits per month",
    "Generate high-quality AI images",
    "Text-to-Image & Image-to-Image",
    "Standard generation speed",
    "Commercial usage allowed",
    "No watermark",
  ],
  limit: {
    adblock: true,
    watermarks: false,
    highResolution: false,
    fullStyles: true,
    credits: { monthly: 500, yearly: 0 },
    private: true,
    features: false,
  },
};

export const PREMIUM_PLAN: PLAN = {
  id: "premium",
  popular: true,
  price: { monthly: 19, yearly: 69 },
  i18n: {
    name: "pricing.pro",
    description: "pricing.proDescription",
    yearlyDescription: "pricing.proYearlyDescription",
    features: "pricing.proFeatures",
    creditsLine: "pricing.proCreditsLine",
  },
  product_id: {
    monthly: CREEM_ACTIVE_PRODUCT_IDS.proMonthly,
    yearly: CREEM_ACTIVE_PRODUCT_IDS.proYearly,
  },
  name: "Pro",
  description:
    "Best value for creators who generate images regularly and need faster results.",
  yearly_description:
    "Save more with an annual plan designed for consistent creators. Enjoy a full year of AI image generation with discounted pricing and plenty of credits for your projects.",
  feature_description: [
    "2000 Credits per month",
    "High-quality AI image generation",
    "Text-to-Image & Image-to-Image",
    "Priority generation speed",
    "Commercial license",
    "No watermark",
    "Higher resolution outputs",
  ],
  limit: {
    adblock: true,
    watermarks: false,
    highResolution: true,
    fullStyles: true,
    credits: { monthly: 2000, yearly: 7000 },
    private: true,
    features: false,
  },
};

export const PRICING_LIST: PLAN[] = [FREE_PLAN, BASIC_PLAN, PREMIUM_PLAN];

export const PLANS: Record<string, PLAN> = PRICING_LIST.reduce(
  (acc, plan) => {
    acc[plan.id] = plan;
    return acc;
  },
  {} as Record<string, PLAN>
);

export const getPlanCreditsByType = (
  plan: PLAN,
  billingType: "monthly" | "yearly"
) => {
  return billingType === "yearly"
    ? plan.limit.credits.yearly
    : plan.limit.credits.monthly;
};

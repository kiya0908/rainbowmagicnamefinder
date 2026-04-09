//pricing组件及多语言内容
import { CREEM_ACTIVE_PRODUCT_IDS } from "../../constants/pricing.js";

import { DEFAULT_TRIAL_DAILY_TRANSLATIONS } from "./config.js";
import {
  type LinkedinTranslatorLocale,
  resolveLinkedinTranslatorLocale,
} from "./i18n";

export const LINKEDIN_TRANSLATOR_SUPPORT_EMAIL =
  "support@linkedinspeaktranslator.top";
export const LINKEDIN_TRANSLATOR_PRIMARY_PRICING_CARD_ID =
  "linkedin-pro-pack";

const LINKEDIN_TRANSLATOR_PRO_PRODUCT_ID =
  CREEM_ACTIVE_PRODUCT_IDS.linkedinCredit200;
const LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID =
  CREEM_ACTIVE_PRODUCT_IDS.linkedinCredit500;

export const LINKEDIN_TRANSLATOR_PRO_PACK = {
  id: LINKEDIN_TRANSLATOR_PRIMARY_PRICING_CARD_ID,
  productId: LINKEDIN_TRANSLATOR_PRO_PRODUCT_ID,
  name: "Pro Credit Pack",
  badge: "One-time top-up",
  price: 4.9,
  credits: 200,
  description:
    "Unlock Extreme intensity, usage-based billing, and a reusable credit balance with no subscription commitment.",
  ctaLabel: "Unlock Pro",
  features: [
    "200 credits included",
    "Extreme intensity unlocked immediately",
    "1 credit per successful paid translation",
    "Credits never expire",
    "Works across both translation directions",
  ],
} as const;

export const LINKEDIN_TRANSLATOR_TEAM_PLAN = {
  id: "team",
  productId: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID,
  name: "Team Credit Pack",
  badge: "One-time top-up",
  price: 9.9,
  credits: 500,
  description:
    "Unlock Extreme intensity, usage-based billing, and a larger reusable credit balance for heavier workflows with no subscription commitment.",
  ctaLabel: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID
    ? "Unlock Team"
    : "Contact sales",
  features: [
    "500 credits included",
    "Extreme intensity unlocked immediately",
    "1 credit per successful paid translation",
    "Credits never expire",
    "Works across both translation directions",
  ],
} as const;

interface LocalizedPricingCard {
  id: string;
  name: string;
  badge: string;
  priceLabel: string;
  description: string;
  ctaLabel: string;
  features: string[];
  productId?: string;
}

interface PricingCardDictionary {
  name: string;
  badge: string;
  description: string;
  ctaLabel: string;
  features: string[];
}

const PRICING_CARD_COPY: Record<
  LinkedinTranslatorLocale,
  {
    free: PricingCardDictionary;
    pro: PricingCardDictionary;
    team: PricingCardDictionary;
  }
> = {
  en: {
    free: {
      name: "Free",
      badge: "No card required",
      description:
        "Sign in to activate your starter credits and daily free quota before buying extra credits.",
      ctaLabel: "Start Free",
      features: [
        "Sign-in required for free usage",
        `${DEFAULT_TRIAL_DAILY_TRANSLATIONS} free translations per day after sign-in`,
        "5 starter credits for new accounts",
        "Light and Standard intensity",
        "Human -> LinkedIn and LinkedIn -> Human",
        "No payment required to validate the workflow",
      ],
    },
    pro: {
      name: "Pro Credit Pack",
      badge: "One-time top-up",
      description:
        "Unlock Extreme intensity, usage-based billing, and a reusable credit balance with no subscription commitment.",
      ctaLabel: "Unlock Pro",
      features: [
        "200 credits included",
        "Extreme intensity unlocked immediately",
        "1 credit per successful paid translation",
        "Credits never expire",
        "Works across both translation directions",
      ],
    },
    team: {
      name: "Team Credit Pack",
      badge: "One-time top-up",
      description:
        "Unlock Extreme intensity, usage-based billing, and a larger reusable credit balance for heavier workflows with no subscription commitment.",
      ctaLabel: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID
        ? "Unlock Team"
        : "Contact sales",
      features: [
        "500 credits included",
        "Extreme intensity unlocked immediately",
        "1 credit per successful paid translation",
        "Credits never expire",
        "Works across both translation directions",
      ],
    },
  },
  zh: {
    free: {
      name: "免费版",
      badge: "无需绑卡",
      description: "登录后可启用起始积分和每日免费额度，再按需购买额外积分。",
      ctaLabel: "免费开始",
      features: [
        "免费使用需要登录",
        `登录后每天 ${DEFAULT_TRIAL_DAILY_TRANSLATIONS} 次免费翻译`,
        "新账号可获得 5 个起始积分",
        "支持 Light 和 Standard 强度",
        "支持 Human -> LinkedIn 与 LinkedIn -> Human",
        "无需付费即可验证整体工作流",
      ],
    },
    pro: {
      name: "专业积分包",
      badge: "一次性充值",
      description:
        "解锁 Extreme 强度、按次扣费模式和可重复使用的积分余额，无需订阅。",
      ctaLabel: "解锁 Pro",
      features: [
        "包含 200 积分",
        "立即解锁 Extreme 强度",
        "每次成功付费翻译扣除 1 积分",
        "积分永久不过期",
        "两种翻译方向都可使用",
      ],
    },
    team: {
      name: "团队积分包",
      badge: "一次性充值",
      description:
        "适合更重的使用场景，提供更大的可复用积分余额，同样无需订阅即可解锁 Extreme。",
      ctaLabel: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID
        ? "解锁 Team"
        : "联系销售",
      features: [
        "包含 500 积分",
        "立即解锁 Extreme 强度",
        "每次成功付费翻译扣除 1 积分",
        "积分永久不过期",
        "两种翻译方向都可使用",
      ],
    },
  },
};

export const getLinkedinTranslatorPricingCards = (
  locale: string
): LocalizedPricingCard[] => {
  const copy = PRICING_CARD_COPY[resolveLinkedinTranslatorLocale(locale)];

  return [
    {
      id: "free",
      name: copy.free.name,
      badge: copy.free.badge,
      priceLabel: "$0",
      description: copy.free.description,
      ctaLabel: copy.free.ctaLabel,
      features: copy.free.features,
    },
    {
      id: LINKEDIN_TRANSLATOR_PRIMARY_PRICING_CARD_ID,
      name: copy.pro.name,
      badge: copy.pro.badge,
      priceLabel: "$4.90",
      description: copy.pro.description,
      ctaLabel: copy.pro.ctaLabel,
      features: copy.pro.features,
      productId: LINKEDIN_TRANSLATOR_PRO_PRODUCT_ID,
    },
    {
      id: "team",
      name: copy.team.name,
      badge: copy.team.badge,
      priceLabel: "$9.90",
      description: copy.team.description,
      ctaLabel: copy.team.ctaLabel,
      features: copy.team.features,
      ...(LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID
        ? { productId: LINKEDIN_TRANSLATOR_TEAM_PRODUCT_ID }
        : {}),
    },
  ];
};


import {
  TRANSLATION_INTENSITIES,
  TRANSLATION_MODES,
  type TranslationIntensity,
  type TranslationMode,
} from "./config";

export const LINKEDIN_TRANSLATOR_LOCALES = ["en", "zh"] as const;
export type LinkedinTranslatorLocale =
  (typeof LINKEDIN_TRANSLATOR_LOCALES)[number];

interface RouteMetaCopy {
  title: string;
  description: string;
}

interface NavLinkCopy {
  label: string;
  href: string;
}

interface HeroCopy {
  eyebrow: string;
  title: string;
  description: string;
}

interface InfoCardCopy {
  title: string;
  descriptionHtml: string;
}

interface StepCopy {
  title: string;
  descriptionHtml: string;
}

interface HighlightCardCopy {
  title: string;
  descriptionHtml: string;
}

interface ComparisonCopy {
  friction: string;
  pivot: string;
}

interface BenefitCardCopy {
  title: string;
  descriptionHtml: string;
  bullets?: string[];
}

interface FAQCopy {
  question: string;
  answerHtml: string;
}

interface HomePageCopy {
  routeMeta: RouteMetaCopy;
  navbar: {
    logoAlt: string;
    signIn: string;
    credits: string;
    navLinks: NavLinkCopy[];
  };
  footer: {
    description: string;
    directoryBadgeTitle: string;
    navLinks: {
      label: string;
      list: Array<{
        to: string;
        label: string;
        target?: string;
      }>;
    }[];
  };
  hero: HeroCopy;
  about: {
    eyebrow: string;
    title: string;
    descriptionHtml: string;
    cards: InfoCardCopy[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    descriptionHtml: string;
    stepsTitle: string;
    stepsIntroHtml: string;
    steps: StepCopy[];
    directionsTitle: string;
    directionsIntroHtml: string;
    directions: HighlightCardCopy[];
    technicalTitle: string;
    technicalIntroHtml: string;
    technicalCards: InfoCardCopy[];
    summaryHtml: string;
  };
  comparisons: {
    frictionLabel: string;
    pivotLabel: string;
    items: ComparisonCopy[];
  };
  whyUs: {
    eyebrow: string;
    title: string;
    descriptionHtml: string;
    cards: BenefitCardCopy[];
    summaryHtml: string;
  };
  pricing: {
    title: string;
    description: string;
    primaryBadge: string;
    includesLabel: string;
    checkoutLoading: string;
    signInBeforeCheckout: string;
    signInFirstHint: string;
    checkoutUnavailable: string;
    invalidCheckout: string;
    billingNoteHtml: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    descriptionHtml: string;
    items: FAQCopy[];
  };
  cta: {
    title: string;
    descriptionHtml: string;
    buttonLabel: string;
  };
}

interface TranslationModeCopy {
  label: string;
  shortLabel: string;
  badge: string;
  inputLabel: string;
  outputLabel: string;
  placeholder: string;
  emptyState: string;
  loadingState: string;
}

interface TranslationIntensityCopy {
  label: string;
  description: string;
  upgradeLabel: string | null;
}

interface TranslationInterfaceCopy {
  badge: string;
  helperCheckingAccess: string;
  headline: string;
  swapMode: string;
  intensitySuffix: string;
  accessLoading: string;
  translate: string;
  translating: string;
  upgradeToUseExtreme: string;
  extremeUnlockHint: string;
  freeQuotaUsedHint: string;
  signInFreeQuotaHint: string;
  paidUsageHint: string;
  trialHint: string;
  signInHint: string;
  outputStatusNeedsRetry: string;
  outputStatusLatest: string;
  outputStatusWaiting: string;
  copy: string;
  copied: string;
  checkingAccessQuota: string;
  translationFailedTitle: string;
  translationFailedFallback: string;
  errors: {
    default: string;
    network: string;
    timeout: string;
    unavailable: string;
    requestFailed: string;
    emptyResponse: string;
  };
}

const DEFAULT_LOCALE: LinkedinTranslatorLocale = "en";

const isLinkedinTranslatorLocale = (
  locale: string
): locale is LinkedinTranslatorLocale =>
  LINKEDIN_TRANSLATOR_LOCALES.includes(
    locale as LinkedinTranslatorLocale
  );

export const resolveLinkedinTranslatorLocale = (
  locale: string
): LinkedinTranslatorLocale =>
  isLinkedinTranslatorLocale(locale) ? locale : DEFAULT_LOCALE;

const HOME_PAGE_COPY: Record<LinkedinTranslatorLocale, HomePageCopy> = {
  en: {
    routeMeta: {
      title:
        "LinkedIn Translator – Translate Profiles, Posts & Messages Instantly",
      description:
        "LinkedIn Translator is an AI translator that converts everyday wording into professional LinkedIn speak with hooks, smart line breaks, and workplace-ready polish.",
    },
    navbar: {
      logoAlt: "LinkedIn Translator logo",
      signIn: "Sign In",
      credits: "Credits",
      navLinks: [
        { label: "About", href: "#about" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "Why Us", href: "#why-choose-us" },
        { label: "FAQ", href: "#faq" },
        { label: "Blog", href: "/blog" },
      ],
    },
    footer: {
      description:
        "AI translation for modern LinkedIn publishing.Not affiliated with LinkedIn. We just help you navigate the language.",
      directoryBadgeTitle: "Featured on directories",
      navLinks: [
        {
          label: "Legal",
          list: [
            { to: "/legal/privacy", label: "Privacy Policy" },
            { to: "/legal/terms", label: "Terms of Service" },
            { to: "/legal/cookie", label: "Cookie Policy" },
          ],
        },
        {
          label: "Support",
          list: [
            {
              to: "mailto:support@linkedinspeaktranslator.top",
              label: "support@linkedinspeaktranslator.top",
              target: "_blank",
            },
            {
              to: "https://linkedinspeaktranslator.top",
              label: "linkedinspeaktranslator.top",
              target: "_blank",
            },
          ],
        },
      ],
    },
    hero: {
      eyebrow: "AI translation for LinkedIn writing",
      title: "Write with clearer positioning and stronger professional tone",
      description:
        "Turn rough drafts into polished LinkedIn-ready copy, or decode corporate buzzwords into plain language.",
    },
    about: {
      eyebrow: "What it is",
      title: "Built for practical professional communication",
      descriptionHtml:
        "This is not generic machine translation. LinkedIn Translator focuses on <strong>clarity, credibility, and structure</strong> for career-facing writing.",
      cards: [
        {
          title: "Dual-mode workflow",
          descriptionHtml:
            "Switch between Human → LinkedIn and LinkedIn → Human for both writing and understanding.",
        },
        {
          title: "Controllable rewrite intensity",
          descriptionHtml:
            "Choose Light, Standard, or Extreme based on how close you want to stay to the original draft.",
        },
        {
          title: "Usage-based credits",
          descriptionHtml:
            "Start with free quota, then scale with one-time credit packs when needed.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "Workflow",
      title: "Three steps from draft to publishable copy",
      descriptionHtml:
        "Paste your text, choose mode and intensity, then generate a cleaner result ready for LinkedIn.",
      stepsTitle: "Step-by-step",
      stepsIntroHtml:
        "The interface is designed for fast iteration with clear controls and predictable output.",
      steps: [
        {
          title: "1. Paste your source text",
          descriptionHtml:
            "Add a rough draft, post idea, profile sentence, or jargon-heavy text.",
        },
        {
          title: "2. Choose mode and intensity",
          descriptionHtml:
            "Control direction and rewrite strength before sending the request.",
        },
        {
          title: "3. Copy and publish",
          descriptionHtml:
            "Review the output, copy in one click, and paste into your workflow.",
        },
      ],
      directionsTitle: "Direction presets",
      directionsIntroHtml:
        "Each mode has tailored prompts and labels for the task you are solving.",
      directions: [
        {
          title: "Human → LinkedIn",
          descriptionHtml:
            "Improve framing, readability, and structure without fabricating facts.",
        },
        {
          title: "LinkedIn → Human",
          descriptionHtml:
            "Decode over-polished phrasing into direct, understandable language.",
        },
      ],
      technicalTitle: "Under the hood",
      technicalIntroHtml:
        "The app enforces prompt and output constraints to keep results concise and credible.",
      technicalCards: [
        {
          title: "Bounded output",
          descriptionHtml:
            "Per-intensity output limits reduce noise and keep copy scannable.",
        },
        {
          title: "No fabricated facts",
          descriptionHtml:
            "Instructions prioritize preserving concrete details from the input.",
        },
      ],
      summaryHtml:
        "Use LinkedIn Translator when you need better wording speed without losing accuracy.",
    },
    comparisons: {
      frictionLabel: "Before",
      pivotLabel: "After",
      items: [
        {
          friction: "I worked on several initiatives and learned a lot.",
          pivot:
            "Led cross-functional initiatives, shipped measurable improvements, and documented rollout learnings.",
        },
      ],
    },
    whyUs: {
      eyebrow: "Why choose us",
      title: "Professional output without generic fluff",
      descriptionHtml:
        "The product is optimized for professional communication quality, not just literal translation.",
      cards: [
        {
          title: "Faster first draft quality",
          descriptionHtml:
            "Reduce editing loops by starting from a stronger, structured output.",
        },
        {
          title: "Clearer outcomes",
          descriptionHtml:
            "Highlight actions, results, and reasoning in language people can trust.",
        },
      ],
      summaryHtml:
        "A practical writing assistant for profiles, posts, and internal/external updates.",
    },
    pricing: {
      title: "Simple usage-based pricing",
      description:
        "Sign in for daily free quota, then buy one-time credit packs when you need more volume.",
      primaryBadge: "Popular",
      includesLabel: "Includes",
      checkoutLoading: "Creating checkout session...",
      signInBeforeCheckout: "Please sign in before checking out.",
      signInFirstHint: "Sign in first, then complete checkout.",
      checkoutUnavailable: "Checkout is temporarily unavailable. Please try again.",
      invalidCheckout: "Invalid checkout session.",
      billingNoteHtml:
        "Billing note: each successful paid translation consumes <strong>1 credit</strong>.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common questions",
      descriptionHtml:
        "Answers about free usage, credit billing, and access to Extreme mode.",
      items: [
        {
          question: "Is there a free plan?",
          answerHtml:
            "Yes. Signed-in users get daily free quota and starter credits for new accounts.",
        },
        {
          question: "How are credits charged?",
          answerHtml:
            "Each successful paid translation deducts <strong>1 credit</strong>.",
        },
      ],
    },
    cta: {
      title: "Ready to improve your LinkedIn writing?",
      descriptionHtml:
        "Start with free quota and upgrade only when your workflow needs more volume.",
      buttonLabel: "Get Started",
    },
  },
  zh: {
    routeMeta: {
      title: "LinkedIn Translator - AI 领英语调转换器",
      description:
        "LinkedIn Translator 是一款 AI 语调转换器，可将日常表达改写为更专业的 LinkedIn 职场表达。",
    },
    navbar: {
      logoAlt: "LinkedIn Translator 标志",
      signIn: "登录",
      credits: "积分",
      navLinks: [
        { label: "关于", href: "#about" },
        { label: "使用方式", href: "#how-it-works" },
        { label: "优势", href: "#why-choose-us" },
        { label: "常见问题", href: "#faq" },
        { label: "博客", href: "/zh/blog" },
      ],
    },
    footer: {
      description: "面向现代职业表达的 LinkedIn AI 翻译与改写工具。",
      directoryBadgeTitle: "收录目录",
      navLinks: [
        {
          label: "法律",
          list: [
            { to: "/legal/privacy", label: "隐私政策" },
            { to: "/legal/terms", label: "服务条款" },
            { to: "/legal/cookie", label: "Cookie 政策" },
          ],
        },
        {
          label: "支持",
          list: [
            {
              to: "mailto:support@linkedinspeaktranslator.top",
              label: "support@linkedinspeaktranslator.top",
              target: "_blank",
            },
            {
              to: "https://linkedinspeaktranslator.top",
              label: "linkedinspeaktranslator.top",
              target: "_blank",
            },
          ],
        },
      ],
    },
    hero: {
      eyebrow: "AI 职业表达改写",
      title: "更快写出清晰、专业、可发布的 LinkedIn 文案",
      description:
        "把草稿改写成更专业的表达，或把职场术语还原成直白语言。",
    },
    about: {
      eyebrow: "产品定位",
      title: "不是直译工具，而是表达优化工具",
      descriptionHtml:
        "LinkedIn Translator 重点优化 <strong>结构、语气和可读性</strong>，让内容更适合职业场景。",
      cards: [
        {
          title: "双向转换",
          descriptionHtml:
            "支持 Human → LinkedIn 与 LinkedIn → Human 两种方向。",
        },
        {
          title: "强度可控",
          descriptionHtml:
            "按需求选择 Light / Standard / Extreme 改写强度。",
        },
      ],
    },
    howItWorks: {
      eyebrow: "使用流程",
      title: "三步完成改写",
      descriptionHtml:
        "输入文本、选择模式和强度，然后一键生成结果。",
      stepsTitle: "步骤",
      stepsIntroHtml: "保持流程简单，便于高频使用。",
      steps: [
        { title: "1. 输入文本", descriptionHtml: "粘贴草稿或待解读文本。" },
        { title: "2. 选择配置", descriptionHtml: "选择模式与改写强度。" },
        { title: "3. 复制结果", descriptionHtml: "检查后复制并发布。" },
      ],
      directionsTitle: "模式说明",
      directionsIntroHtml: "每种模式都有独立的输入输出语义。",
      directions: [
        {
          title: "Human → LinkedIn",
          descriptionHtml: "把普通表达改成更专业、更可发布的语气。",
        },
        {
          title: "LinkedIn → Human",
          descriptionHtml: "把抽象术语还原成清晰直白的表达。",
        },
      ],
      technicalTitle: "实现原则",
      technicalIntroHtml: "通过约束输出和提示词控制稳定性。",
      technicalCards: [
        { title: "长度控制", descriptionHtml: "按强度控制输出长度。" },
        { title: "事实保留", descriptionHtml: "优先保留输入中的具体事实。" },
      ],
      summaryHtml: "在效率和表达质量之间取得更好的平衡。",
    },
    comparisons: {
      frictionLabel: "改写前",
      pivotLabel: "改写后",
      items: [
        {
          friction: "这件事我做了不少工作。",
          pivot: "主导了关键环节并推动交付，沉淀了可复用的方法。",
        },
      ],
    },
    whyUs: {
      eyebrow: "核心优势",
      title: "更适合真实职业场景",
      descriptionHtml: "强调清晰和可信，不堆砌空泛词汇。",
      cards: [
        {
          title: "节省时间",
          descriptionHtml: "减少反复润色时间，提高发布效率。",
        },
        {
          title: "表达更清楚",
          descriptionHtml: "更容易让招聘方、同事和合作方读懂重点。",
        },
      ],
      summaryHtml: "适用于动态、简历、简介和日常职业沟通。",
    },
    pricing: {
      title: "按需使用的计费方式",
      description: "登录后可用每日免费额度，超出后按积分包使用。",
      primaryBadge: "推荐",
      includesLabel: "包含",
      checkoutLoading: "正在创建结账...",
      signInBeforeCheckout: "请先登录再进行购买。",
      signInFirstHint: "请先登录，然后继续购买流程。",
      checkoutUnavailable: "暂时无法结账，请稍后重试。",
      invalidCheckout: "结账会话无效。",
      billingNoteHtml:
        "计费说明：每次成功的付费翻译扣除 <strong>1 积分</strong>。",
    },
    faq: {
      eyebrow: "常见问题",
      title: "FAQ",
      descriptionHtml: "关于免费额度、积分消耗和强度解锁的说明。",
      items: [
        {
          question: "可以免费使用吗？",
          answerHtml: "可以，登录后可获得每日免费翻译额度。",
        },
        {
          question: "积分如何扣除？",
          answerHtml: "每次成功的付费翻译扣除 <strong>1 积分</strong>。",
        },
      ],
    },
    cta: {
      title: "准备好优化你的职业表达了吗？",
      descriptionHtml: "从免费额度开始，按需升级。",
      buttonLabel: "立即开始",
    },
  },
};

const TRANSLATION_MODE_COPY: Record<
  LinkedinTranslatorLocale,
  Record<TranslationMode, TranslationModeCopy>
> = {
  en: {
    "human-to-linkedin": {
      label: "Human -> LinkedIn",
      shortLabel: "Polish for LinkedIn",
      badge: "LinkedIn-ready",
      inputLabel: "Raw draft",
      outputLabel: "Polished version",
      placeholder:
        "I shipped the feature, but the rollout was messy and I learned a lot from the feedback.",
      emptyState:
        "Your LinkedIn-ready version will appear here with clearer positioning and a stronger professional tone.",
      loadingState:
        "Rewriting your draft into a professional LinkedIn version...",
    },
    "linkedin-to-human": {
      label: "LinkedIn -> Human",
      shortLabel: "Decode LinkedIn speak",
      badge: "Plain language",
      inputLabel: "LinkedIn-style text",
      outputLabel: "Human version",
      placeholder:
        "Thrilled to share that I leveraged cross-functional alignment to unlock a scalable growth motion for our users.",
      emptyState:
        "The plain-English explanation will appear here with the buzzwords stripped out.",
      loadingState:
        "Decoding the corporate jargon into direct, plain language...",
    },
  },
  zh: {
    "human-to-linkedin": {
      label: "Human -> LinkedIn",
      shortLabel: "润色为 LinkedIn 表达",
      badge: "LinkedIn 可发布",
      inputLabel: "原始文本",
      outputLabel: "润色结果",
      placeholder: "我把这个功能上线了，但过程有点混乱，也学到了很多。",
      emptyState: "你的 LinkedIn 润色结果会显示在这里。",
      loadingState: "正在将你的文本改写为更专业的 LinkedIn 表达...",
    },
    "linkedin-to-human": {
      label: "LinkedIn -> Human",
      shortLabel: "还原职场术语",
      badge: "直白表达",
      inputLabel: "LinkedIn 风格文本",
      outputLabel: "直白版本",
      placeholder:
        "Thrilled to share that I leveraged cross-functional alignment to unlock a scalable growth motion for our users.",
      emptyState: "还原后的直白表达会显示在这里。",
      loadingState: "正在将术语表达还原为更直白的语言...",
    },
  },
};

const TRANSLATION_INTENSITY_COPY: Record<
  LinkedinTranslatorLocale,
  Record<TranslationIntensity, TranslationIntensityCopy>
> = {
  en: {
    light: {
      label: "Light",
      description: "Subtle rewrite that stays close to the original wording.",
      upgradeLabel: null,
    },
    standard: {
      label: "Standard",
      description:
        "Balanced rewrite with clearer structure and stronger readability.",
      upgradeLabel: null,
    },
    extreme: {
      label: "Extreme",
      description:
        "Most opinionated rewrite with sharper framing and stronger positioning.",
      upgradeLabel: "Upgrade to unlock",
    },
  },
  zh: {
    light: {
      label: "Light",
      description: "轻度改写，尽量贴近原句。",
      upgradeLabel: null,
    },
    standard: {
      label: "Standard",
      description: "平衡改写，增强结构与可读性。",
      upgradeLabel: null,
    },
    extreme: {
      label: "Extreme",
      description: "更强表达，突出重点和定位。",
      upgradeLabel: "升级后可用",
    },
  },
};

const TRANSLATION_INTERFACE_COPY: Record<
  LinkedinTranslatorLocale,
  TranslationInterfaceCopy
> = {
  en: {
    badge: "AI Rewrite Console",
    helperCheckingAccess: "Checking your access status...",
    headline: "Translate and polish your LinkedIn writing in one workspace",
    swapMode: "Swap mode",
    intensitySuffix: "intensity",
    accessLoading: "Checking access...",
    translate: "Translate",
    translating: "Translating...",
    upgradeToUseExtreme: "Upgrade to use Extreme",
    extremeUnlockHint: "Extreme mode requires paid access.",
    freeQuotaUsedHint: "Daily free quota used. Upgrade to continue.",
    signInFreeQuotaHint: "Sign in to use your daily free quota.",
    paidUsageHint: "Paid access active. 1 credit per successful translation.",
    trialHint: "Daily free quota available.",
    signInHint: "Sign in to begin.",
    outputStatusNeedsRetry: "Needs retry",
    outputStatusLatest: "Latest output",
    outputStatusWaiting: "Waiting for output",
    copy: "Copy",
    copied: "Copied",
    checkingAccessQuota: "Checking quota...",
    translationFailedTitle: "Translation failed",
    translationFailedFallback: "Please try again in a moment.",
    errors: {
      default: "Translation failed. Please try again.",
      network: "Network error. Please check your connection and retry.",
      timeout: "Request timed out. Please retry.",
      unavailable: "Service temporarily unavailable. Please retry later.",
      requestFailed: "Request failed. Please retry.",
      emptyResponse: "Empty response received from translator.",
    },
  },
  zh: {
    badge: "AI 改写控制台",
    helperCheckingAccess: "正在检查你的访问状态...",
    headline: "在同一界面完成 LinkedIn 文案改写与解读",
    swapMode: "切换模式",
    intensitySuffix: "强度",
    accessLoading: "正在检查访问权限...",
    translate: "开始翻译",
    translating: "翻译中...",
    upgradeToUseExtreme: "升级后使用 Extreme",
    extremeUnlockHint: "Extreme 模式需要付费权限。",
    freeQuotaUsedHint: "今日免费额度已用完，升级后继续使用。",
    signInFreeQuotaHint: "请先登录以使用每日免费额度。",
    paidUsageHint: "已开通付费权限，每次成功翻译消耗 1 积分。",
    trialHint: "你还有每日免费额度可用。",
    signInHint: "请先登录后开始使用。",
    outputStatusNeedsRetry: "需要重试",
    outputStatusLatest: "最新输出",
    outputStatusWaiting: "等待输出",
    copy: "复制",
    copied: "已复制",
    checkingAccessQuota: "正在检查额度...",
    translationFailedTitle: "翻译失败",
    translationFailedFallback: "请稍后重试。",
    errors: {
      default: "翻译失败，请重试。",
      network: "网络异常，请检查连接后重试。",
      timeout: "请求超时，请重试。",
      unavailable: "服务暂时不可用，请稍后重试。",
      requestFailed: "请求失败，请重试。",
      emptyResponse: "翻译结果为空，请重试。",
    },
  },
};

export const getLinkedinTranslatorHomePageCopy = (
  locale: string
): HomePageCopy => HOME_PAGE_COPY[resolveLinkedinTranslatorLocale(locale)];

export const getLinkedinTranslatorRouteMeta = (
  locale: string
): RouteMetaCopy => getLinkedinTranslatorHomePageCopy(locale).routeMeta;

export const getLocalizedTranslationModes = (locale: string) => {
  const localized = TRANSLATION_MODE_COPY[resolveLinkedinTranslatorLocale(locale)];
  return TRANSLATION_MODES.map((mode) => ({
    value: mode.value,
    ...localized[mode.value],
  }));
};

export const getLocalizedTranslationModeConfig = (
  locale: string,
  mode: TranslationMode
): TranslationModeCopy => {
  const localized = TRANSLATION_MODE_COPY[resolveLinkedinTranslatorLocale(locale)];
  return localized[mode] ?? localized["human-to-linkedin"];
};

export const getLocalizedTranslationIntensities = (locale: string) => {
  const localized =
    TRANSLATION_INTENSITY_COPY[resolveLinkedinTranslatorLocale(locale)];
  return TRANSLATION_INTENSITIES.map((intensity) => ({
    value: intensity.value,
    ...localized[intensity.value],
  }));
};

export const getLocalizedTranslationIntensityConfig = (
  locale: string,
  intensity: TranslationIntensity
): TranslationIntensityCopy => {
  const localized =
    TRANSLATION_INTENSITY_COPY[resolveLinkedinTranslatorLocale(locale)];
  return localized[intensity] ?? localized.light;
};

export const getTranslationInterfaceCopy = (
  locale: string
): TranslationInterfaceCopy =>
  TRANSLATION_INTERFACE_COPY[resolveLinkedinTranslatorLocale(locale)];

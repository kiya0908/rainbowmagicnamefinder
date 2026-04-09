export const TRANSLATION_MODES = [
  {
    value: "human-to-linkedin",
    label: "Human -> LinkedIn",
    shortLabel: "Polish for LinkedIn",
    badge: "LinkedIn-ready",
    inputLabel: "Raw draft",
    outputLabel: "Polished version",
    placeholder:
      "I shipped the feature, but the rollout was messy and I learned a lot from the feedback.",
    emptyState:
      "Your LinkedIn-ready version will appear here with clearer positioning and a stronger professional tone.",
    loadingState: "Rewriting your draft into a professional LinkedIn version...",
  },
  {
    value: "linkedin-to-human",
    label: "LinkedIn -> Human",
    shortLabel: "Decode LinkedIn speak",
    badge: "Plain language",
    inputLabel: "LinkedIn-style text",
    outputLabel: "Human version",
    placeholder:
      "Thrilled to share that I leveraged cross-functional alignment to unlock a scalable growth motion for our users.",
    emptyState:
      "The plain-English explanation will appear here with the buzzwords stripped out.",
    loadingState: "Decoding the corporate jargon into direct, plain language...",
  },
] as const;

export const TRANSLATION_INTENSITIES = [
  {
    value: "light",
    label: "Light",
    description: "Subtle rewrite that stays close to the original wording.",
    upgradeLabel: null,
  },
  {
    value: "standard",
    label: "Standard",
    description: "Balanced rewrite with clearer structure and stronger readability.",
    upgradeLabel: null,
  },
  {
    value: "extreme",
    label: "Extreme",
    description: "Most opinionated rewrite with sharper framing and stronger positioning.",
    upgradeLabel: "Upgrade to unlock",
  },
] as const;

export type TranslationMode = (typeof TRANSLATION_MODES)[number]["value"];
export type TranslationIntensity =
  (typeof TRANSLATION_INTENSITIES)[number]["value"];

export interface PromptProfile {
  locked: boolean;
  outputMaxChars: number;
  focus: string;
  rules: string[];
}

export interface TranslationPromptSet {
  systemPrompt: string;
  userPrompt: string;
  outputMaxChars: number;
}

export interface TranslationUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const MAX_TRANSLATION_INPUT_CHARS = 5000;
export const LINKEDIN_TRANSLATOR_INPUT_CREDITS_PER_MILLION = 18;
export const LINKEDIN_TRANSLATOR_OUTPUT_CREDITS_PER_MILLION = 150;
export const DEFAULT_FREE_DAILY_TRANSLATIONS = 0;
export const DEFAULT_TRIAL_DAILY_TRANSLATIONS = 5;
export const DEFAULT_EXPIRED_DAILY_TRANSLATIONS = 5;
export const GUEST_FREE_TRANSLATIONS_PER_DAY = DEFAULT_FREE_DAILY_TRANSLATIONS;
export const GUEST_QUOTA_STORAGE_KEY =
  "linkedin-translator.translation-interface.guest-quota";

const COMMON_PROMPT_RULES = [
  "Preserve concrete facts, names, numbers, dates, tools, and outcomes. Never invent metrics, titles, employers, or achievements.",
  "Keep the source language unless the source itself clearly asks for a language shift.",
  "Return only the final rewritten text with no labels, no bullet prefixes like 'Translation:', and no markdown fences.",
  "Do not add hashtags unless the user already wrote hashtags in the source text.",
  "If the source is vague, keep it honest and vague instead of fabricating details.",
] as const;

const PROMPT_PROFILES: Record<
  TranslationMode,
  Record<TranslationIntensity, PromptProfile>
> = {
  "human-to-linkedin": {
    light: {
      locked: false,
      outputMaxChars: 700,
      focus:
        "Lightly polish the user's draft for LinkedIn while preserving the original meaning, confidence level, and order of ideas.",
      rules: [
        "Stay close to the original structure and avoid adding a new hook if the source does not naturally support one.",
        "Improve grammar, tighten wording, and make the copy more professional without sounding inflated.",
        "Keep the final output concise and easy to paste into LinkedIn immediately.",
      ],
    },
    standard: {
      locked: false,
      outputMaxChars: 900,
      focus:
        "Rewrite the user's draft into a polished LinkedIn-ready post with stronger structure, clearer positioning, and better readability.",
      rules: [
        "Use short paragraphs or line breaks when they improve scan-ability.",
        "Lead with the most important point early, but keep the rewrite credible and specific.",
        "End with a grounded takeaway instead of a generic motivational slogan.",
      ],
    },
    extreme: {
      locked: true,
      outputMaxChars: 1100,
      focus:
        "Transform the user's draft into a high-conviction LinkedIn post with a sharper hook, stronger business framing, and a clear action-oriented finish.",
      rules: [
        "Sound ambitious and executive-ready without becoming cheesy or dishonest.",
        "Use stronger contrast, tighter framing, and cleaner pacing than Standard mode.",
        "If the source supports it, end with one crisp forward-looking insight or call to action.",
      ],
    },
  },
  "linkedin-to-human": {
    light: {
      locked: false,
      outputMaxChars: 700,
      focus:
        "Rewrite the user's LinkedIn-style or corporate text into direct, simple language while preserving the original order and core meaning.",
      rules: [
        "Keep the explanation close to the source and avoid adding commentary.",
        "Replace buzzwords with plain equivalents, but do not add new advice.",
        "Make the result feel like what the writer actually means in everyday language.",
      ],
    },
    standard: {
      locked: false,
      outputMaxChars: 900,
      focus:
        "Decode the user's LinkedIn-style or corporate jargon into clear plain language, making implied meaning explicit when the source strongly suggests it.",
      rules: [
        "Remove abstraction, compress repetition, and surface the practical meaning behind the jargon.",
        "If the source hides a request, goal, or tradeoff, state it plainly.",
        "Keep the tone neutral, clear, and readable for a busy coworker.",
      ],
    },
    extreme: {
      locked: true,
      outputMaxChars: 850,
      focus:
        "Convert the user's LinkedIn-style or corporate jargon into blunt, practical language with the fluff removed and the real ask or implication made obvious.",
      rules: [
        "Be direct and concrete, but stay fair and factual.",
        "Prefer plain operational language over management jargon.",
        "If the source is vague, say that it is vague instead of pretending certainty.",
      ],
    },
  },
};

export const DEFAULT_INTENSITY_BY_MODE: Record<
  TranslationMode,
  TranslationIntensity
> = {
  "human-to-linkedin": "standard",
  "linkedin-to-human": "light",
};

export const getPromptProfile = (
  mode: TranslationMode,
  intensity: TranslationIntensity
) => PROMPT_PROFILES[mode][intensity];

export const buildTranslationPromptSet = (
  mode: TranslationMode,
  intensity: TranslationIntensity,
  text: string
): TranslationPromptSet => {
  const profile = getPromptProfile(mode, intensity);
  const systemPrompt = [
    "You are LinkedIn Translator, a controlled rewriting engine for professional tone conversion.",
    profile.focus,
    ...COMMON_PROMPT_RULES,
    ...profile.rules,
    `Keep the final output under ${profile.outputMaxChars} characters unless the source already exceeds that length and shortening it would remove essential meaning.`,
  ].join("\n");

  const userPrompt = [
    "Rewrite the source text according to the active profile.",
    "",
    "<source>",
    text.trim(),
    "</source>",
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
    outputMaxChars: profile.outputMaxChars,
  };
};

export const isLockedIntensity = (
  intensity: TranslationIntensity,
  hasPaidAccess: boolean
) => getPromptProfile("human-to-linkedin", intensity).locked && !hasPaidAccess;

export const extractJsonTranslation = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const translation = parsed.translation;
    if (typeof translation === "string" && translation.trim()) {
      return translation.trim();
    }

    const response = parsed.response;
    if (typeof response === "string" && response.trim()) {
      return response.trim();
    }
  } catch {
    return null;
  }

  return null;
};

export const sanitizeTranslationOutput = (
  raw: string,
  outputMaxChars: number
) => {
  let value = raw.trim();

  value = value.replace(/^```(?:json|text)?\s*/i, "").replace(/\s*```$/, "");
  value = extractJsonTranslation(value) ?? value;
  value = value.replace(/^(translation|output|result)\s*:\s*/i, "");

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  value = value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (!value) return "";
  if (value.length <= outputMaxChars) return value;

  const candidate = value.slice(0, outputMaxChars).trimEnd();
  const sentenceBreak = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("? "),
    candidate.lastIndexOf("\n")
  );

  if (sentenceBreak >= Math.floor(outputMaxChars * 0.6)) {
    return candidate.slice(0, sentenceBreak + 1).trimEnd();
  }

  const wordBreak = candidate.lastIndexOf(" ");
  if (wordBreak >= Math.floor(outputMaxChars * 0.7)) {
    return `${candidate.slice(0, wordBreak).trimEnd()}...`;
  }

  return `${candidate}...`;
};

export const estimateTextTokens = (text: string) =>
  Math.max(1, Math.ceil(text.trim().length / 4));

export const calculateTranslationCredits = (usage: Partial<TranslationUsage>) => {
  const promptTokens = Math.max(0, usage.promptTokens ?? 0);
  const completionTokens = Math.max(0, usage.completionTokens ?? 0);

  if (promptTokens === 0 && completionTokens === 0) return 0;

  const weightedCredits =
    promptTokens * LINKEDIN_TRANSLATOR_INPUT_CREDITS_PER_MILLION +
    completionTokens * LINKEDIN_TRANSLATOR_OUTPUT_CREDITS_PER_MILLION;

  return Math.max(1, Math.ceil(weightedCredits / 1_000_000));
};

export const estimateTranslationCreditsUpperBound = (
  mode: TranslationMode,
  intensity: TranslationIntensity,
  text: string
) => {
  const promptSet = buildTranslationPromptSet(mode, intensity, text);

  return calculateTranslationCredits({
    promptTokens:
      estimateTextTokens(promptSet.systemPrompt) +
      estimateTextTokens(promptSet.userPrompt),
    completionTokens: estimateTextTokens("x".repeat(promptSet.outputMaxChars)),
  });
};

export const getModeConfig = (mode: TranslationMode) =>
  TRANSLATION_MODES.find((item) => item.value === mode) ?? TRANSLATION_MODES[0];

export const getIntensityConfig = (intensity: TranslationIntensity) =>
  TRANSLATION_INTENSITIES.find((item) => item.value === intensity) ??
  TRANSLATION_INTENSITIES[0];

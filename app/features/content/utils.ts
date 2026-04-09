//提供子路由/tools /templates /blog 相关的工具函数，比如路径生成、语言判断、目录文案、日期格式化。
import {
  CONTENT_COLLECTIONS,
  CONTENT_LOCALES,
  type CollectionPageContent,
  type ContentCollection,
  type ContentLocale,
} from "./types";

const COLLECTION_LABELS: Record<
  ContentLocale,
  Record<ContentCollection, string>
> = {
  en: {
    tools: "Tools",
    templates: "Templates",
    blog: "Blog",
  },
  zh: {
    tools: "工具",
    templates: "模板",
    blog: "博客",
  },
};

const COLLECTION_PAGE_COPY: Record<
  ContentLocale,
  Record<
    ContentCollection,
    Omit<CollectionPageContent, "collection" | "locale">
  >
> = {
  en: {
    tools: {
      title: "LinkedIn Translation Tools",
      description:
        "Browse focused LinkedIn translation tools for profile localization and bilingual publishing workflows.",
      eyebrow: "Conversion-ready workflows",
      heading: "Specialized tools for LinkedIn profile and language-pair translation",
      intro:
        "These landing pages target users who already know what task they want to complete. Each tool page keeps the layout focused on intent, SEO, and a clear path back to the main translator.",
      emptyState: "More LinkedIn tools will appear here as new use cases are published.",
    },
    templates: {
      title: "LinkedIn Templates and Samples",
      description:
        "Explore LinkedIn profile samples, bilingual summary templates, and practical copy blocks for professional outreach.",
      eyebrow: "High-intent resources",
      heading: "Templates that turn research traffic into product-qualified visitors",
      intro:
        "Template pages attract users who want examples they can adapt quickly. Each page is designed to deliver value first, then route readers into the translation workflow.",
      emptyState:
        "Template pages will appear here once the first batch of resources is published.",
    },
    blog: {
      title: "LinkedIn Speak Translator Blog",
      description:
        "Read practical guides on using LinkedIn Speak Translator (LinkedIn Translator) to improve profiles, posts, and professional messaging.",
      eyebrow: "LinkedIn Speak Translator Blog hub",
      heading:
        "Guides built around LinkedIn Speak Translator search intent and product conversion",
      intro:
        "These blog pages target informational queries around LinkedIn Speak Translator and LinkedIn Translator.",
      emptyState:
        "More LinkedIn Speak Translator guides will appear here as new articles are published.",
    },
  },
  zh: {
    tools: {
      title: "LinkedIn 翻译工具",
      description:
        "聚合 LinkedIn 个人主页翻译与语种定向翻译工具页，方便后续持续扩展中英文内容。",
      eyebrow: "以转化为导向的工具页",
      heading: "围绕 LinkedIn 个人主页与语种需求搭建的专项工具",
      intro:
        "这些页面优先承接已经带着明确任务来到站点的用户。首批先做最核心的两个工具页，并把中英双语结构一起铺好。",
      emptyState: "更多 LinkedIn 工具页会在后续内容整理完成后继续补充。",
    },
    templates: {
      title: "LinkedIn 模板与示例",
      description:
        "集中展示 LinkedIn 主页示例、双语摘要模板和便于复制改写的职业表达素材。",
      eyebrow: "资源型内容目录",
      heading: "先提供可参考的模板，再自然引导用户进入翻译工具",
      intro:
        "模板页的目标是先承接搜索流量，再把用户引导到可直接使用的翻译产品页。中文镜像页会沿用同一结构，方便后续同步维护。",
      emptyState: "模板目录会随着后续内容补充而持续扩充。",
    },
    blog: {
      title: "LinkedIn Speak Translator 博客",
      description:
        "围绕 LinkedIn Speak Translator（LinkedIn Translator）的实战指南，帮助你优化 LinkedIn 主页、动态和职业沟通表达。",
      eyebrow: "LinkedIn Speak Translator 博客 内容中心",
      heading: "围绕 LinkedIn Speak Translator 搜索意图构建，并服务产品转化",
      intro:
        "博客页聚焦 LinkedIn Speak Translator 与 LinkedIn Translator 相关的信息型搜索问题。",
      emptyState:
        "后续会持续发布更多围绕 LinkedIn Speak Translator 的实用文章。",
    },
  },
};

export function isContentCollection(
  value: string
): value is ContentCollection {
  return (CONTENT_COLLECTIONS as readonly string[]).includes(value);
}

export function isContentLocale(value: string): value is ContentLocale {
  return (CONTENT_LOCALES as readonly string[]).includes(value);
}

export function getLocalePrefix(locale: ContentLocale) {
  return locale === "zh" ? "/zh" : "";
}

export function getHomePath(locale: ContentLocale) {
  return locale === "zh" ? "/zh" : "/";
}

export function getCollectionPath(
  locale: ContentLocale,
  collection: ContentCollection
) {
  const prefix = getLocalePrefix(locale);
  return `${prefix}/${collection}`;
}

export function getContentPath(
  locale: ContentLocale,
  collection: ContentCollection,
  slug: string
) {
  return `${getCollectionPath(locale, collection)}/${slug}`;
}

export function inferLocaleFromPathname(pathname: string): ContentLocale {
  return pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
}

export function inferContentContext(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const locale = inferLocaleFromPathname(pathname);
  const collectionIndex = locale === "zh" ? 1 : 0;
  const maybeCollection = segments[collectionIndex];

  if (!maybeCollection || !isContentCollection(maybeCollection)) {
    return null;
  }

  return {
    locale,
    collection: maybeCollection,
    slug: segments[collectionIndex + 1] ?? null,
  };
}

export function getCollectionLabel(
  collection: ContentCollection,
  locale: ContentLocale
) {
  return COLLECTION_LABELS[locale][collection];
}

export function getCollectionPageContent(
  locale: ContentLocale,
  collection: ContentCollection
): CollectionPageContent {
  return {
    locale,
    collection,
    ...COLLECTION_PAGE_COPY[locale][collection],
  };
}

export function getLocaleSwitchLabel(locale: ContentLocale) {
  return locale === "en" ? "中文" : "English";
}

export function getLocalizedHomeLabel(locale: ContentLocale) {
  return locale === "en" ? "Home" : "首页";
}

export function formatContentDate(
  dateValue: string | undefined,
  locale: ContentLocale
) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.valueOf())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "long",
  }).format(date);
}

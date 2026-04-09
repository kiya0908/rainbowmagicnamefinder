//定义内容页的核心类型，包括集合、语言、条目摘要、详情和 sitemap 类型。
export const CONTENT_COLLECTIONS = ["tools", "templates", "blog"] as const;
export const CONTENT_LOCALES = ["en", "zh"] as const;

export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export interface ContentEntrySummary {
  collection: ContentCollection;
  locale: ContentLocale;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  keywords: string[];
  publishedAt?: string;
  updatedAt?: string;
  indexable: boolean;
  sitemapPriority: string;
  translationGroup: string;
  path: string;
}

export interface ContentEntry extends ContentEntrySummary {
  body: string;
}

export interface CollectionPageContent {
  collection: ContentCollection;
  locale: ContentLocale;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  emptyState: string;
}

export interface ContentIndexPolicy {
  indexable: boolean;
  includeInSitemap: boolean;
}

export interface SitemapEntry {
  path: string;
  priority: string;
  lastmod?: Date;
}

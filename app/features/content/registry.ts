//扫描 app/content 下所有 Markdown，生成内容注册表，并提供列表、详情、镜像页、sitemap 数据。
import type {
  ContentCollection,
  ContentEntry,
  ContentEntrySummary,
  ContentLocale,
  SitemapEntry,
} from "./types";
import { CONTENT_COLLECTIONS, CONTENT_LOCALES } from "./types";
import {
  canIncludeCollectionInSitemap,
  canIncludeEntryInSitemap,
} from "./indexing-policy";
import {
  getCollectionPageContent,
  getCollectionPath,
  getContentPath,
  isContentCollection,
  isContentLocale,
} from "./utils";

import { parseFrontmatter } from "./frontmatter";

const markdownModules = import.meta.glob("../../content/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const DETAIL_SITEMAP_PRIORITY: Record<ContentCollection, string> = {
  tools: "0.85",
  templates: "0.8",
  blog: "0.75",
};

const LIST_SITEMAP_PRIORITY: Record<ContentCollection, string> = {
  tools: "0.8",
  templates: "0.75",
  blog: "0.7",
};

const normalizeString = (
  value: unknown,
  field: string,
  sourcePath: string
) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing "${field}" in ${sourcePath}.`);
  }

  return value.trim();
};

const optionalString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const toSummary = ({
  body: _body,
  ...entry
}: ContentEntry): ContentEntrySummary => entry;

const sortEntries = (entries: ContentEntry[]) => {
  return entries.sort((left, right) => {
    const leftDate = left.updatedAt ?? left.publishedAt ?? "";
    const rightDate = right.updatedAt ?? right.publishedAt ?? "";

    if (leftDate !== rightDate) {
      return rightDate.localeCompare(leftDate);
    }

    return left.title.localeCompare(right.title);
  });
};

const buildEntry = (sourcePath: string, rawContent: string): ContentEntry => {
  const { data, body } = parseFrontmatter(rawContent);

  const locale = normalizeString(data.locale, "locale", sourcePath);
  const collection = normalizeString(data.collection, "collection", sourcePath);
  const slug = normalizeString(data.slug, "slug", sourcePath);

  if (!isContentLocale(locale)) {
    throw new Error(`Invalid locale "${locale}" in ${sourcePath}.`);
  }

  if (!isContentCollection(collection)) {
    throw new Error(`Invalid collection "${collection}" in ${sourcePath}.`);
  }

  const keywords = Array.isArray(data.keywords)
    ? data.keywords.filter((value): value is string => typeof value === "string")
    : [];

  return {
    locale,
    collection,
    slug,
    title: normalizeString(data.title, "title", sourcePath),
    description: normalizeString(data.description, "description", sourcePath),
    excerpt: normalizeString(data.excerpt, "excerpt", sourcePath),
    keywords,
    publishedAt: optionalString(data.publishedAt),
    updatedAt: optionalString(data.updatedAt),
    indexable: typeof data.indexable === "boolean" ? data.indexable : true,
    sitemapPriority:
      optionalString(data.sitemapPriority) ?? DETAIL_SITEMAP_PRIORITY[collection],
    translationGroup: normalizeString(
      data.translationGroup,
      "translationGroup",
      sourcePath
    ),
    path: getContentPath(locale, collection, slug),
    body,
  };
};

const ENTRIES = sortEntries(
  Object.entries(markdownModules).map(([sourcePath, rawContent]) =>
    buildEntry(sourcePath, rawContent)
  )
);

const getLatestEntryDate = (entries: ContentEntrySummary[]) => {
  const latestValue = entries
    .map((entry) => entry.updatedAt ?? entry.publishedAt)
    .find(Boolean);

  return latestValue ? new Date(latestValue) : undefined;
};

export function getCollectionEntries(
  locale: ContentLocale,
  collection: ContentCollection
) {
  return ENTRIES.filter(
    (entry) => entry.locale === locale && entry.collection === collection
  ).map(toSummary);
}

export function getContentEntry(
  locale: ContentLocale,
  collection: ContentCollection,
  slug: string
) {
  return (
    ENTRIES.find(
      (entry) =>
        entry.locale === locale &&
        entry.collection === collection &&
        entry.slug === slug
    ) ?? null
  );
}

export function getAlternateEntry(entry: ContentEntry) {
  const alternateLocale: ContentLocale = entry.locale === "en" ? "zh" : "en";
  const alternateEntry =
    ENTRIES.find(
      (candidate) =>
        candidate.translationGroup === entry.translationGroup &&
        candidate.locale === alternateLocale
    ) ?? null;

  return alternateEntry ? toSummary(alternateEntry) : null;
}

export function getCollectionPageData(
  locale: ContentLocale,
  collection: ContentCollection
) {
  return {
    page: getCollectionPageContent(locale, collection),
    entries: getCollectionEntries(locale, collection),
  };
}

export function getContentSitemapEntries(): SitemapEntry[] {
  const listEntries: SitemapEntry[] = [];

  for (const locale of CONTENT_LOCALES) {
    for (const collection of CONTENT_COLLECTIONS) {
      if (!canIncludeCollectionInSitemap(locale, collection)) continue;

      const entries = getCollectionEntries(locale, collection).filter(
        (entry) => canIncludeEntryInSitemap(entry)
      );

      if (!entries.length) continue;

      listEntries.push({
        path: getCollectionPath(locale, collection),
        priority: LIST_SITEMAP_PRIORITY[collection],
        lastmod: getLatestEntryDate(entries),
      });
    }
  }

  const detailEntries = ENTRIES.filter((entry) =>
    canIncludeEntryInSitemap(entry)
  ).map(
    (entry) =>
      ({
        path: entry.path,
        priority: entry.sitemapPriority,
        lastmod: entry.updatedAt
          ? new Date(entry.updatedAt)
          : entry.publishedAt
            ? new Date(entry.publishedAt)
            : undefined,
      }) satisfies SitemapEntry
  );

  return [...listEntries, ...detailEntries];
}

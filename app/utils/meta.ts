import type { MetaDescriptor } from "react-router";

import { SITE_NAME, toSiteUrl } from "~/config/site";

interface SeoAlternateDescriptor {
  hrefLang: string;
  pathname: string;
}

interface SeoDescriptorOptions {
  pathname: string;
  domain?: string;
  title?: string;
  description?: string;
  robots?: string;
  alternates?: SeoAlternateDescriptor[];
  jsonLd?: Record<string, unknown>;
  ogType?: "website" | "article";
}

interface WebPageJsonLdOptions {
  pathname: string;
  domain?: string;
  title: string;
  description: string;
  locale?: string;
  type?: "WebPage" | "CollectionPage" | "Article";
  publishedAt?: string;
  updatedAt?: string;
}

export const createCanonical = (
  pathname: string,
  domain?: string
): MetaDescriptor => {
  return {
    tagName: "link",
    rel: "canonical",
    href: toSiteUrl(pathname, domain),
  };
};

export const createAlternate = (
  pathname: string,
  domain: string | undefined,
  hrefLang: string
): MetaDescriptor => {
  return {
    tagName: "link",
    rel: "alternate",
    hrefLang,
    href: toSiteUrl(pathname, domain),
  };
};

export const createSeoDescriptors = ({
  pathname,
  domain,
  title,
  description,
  robots,
  alternates,
  jsonLd,
  ogType = "website",
}: SeoDescriptorOptions): MetaDescriptor[] => {
  const absoluteUrl = toSiteUrl(pathname, domain);
  const descriptors: MetaDescriptor[] = [];

  if (robots) {
    descriptors.push({ name: "robots", content: robots });
  }

  descriptors.push(createCanonical(pathname, domain));
  descriptors.push({ property: "og:url", content: absoluteUrl });
  descriptors.push({ property: "og:type", content: ogType });
  descriptors.push({ property: "og:site_name", content: SITE_NAME });
  descriptors.push({ name: "twitter:card", content: "summary" });

  if (title) {
    descriptors.push({ property: "og:title", content: title });
    descriptors.push({ name: "twitter:title", content: title });
  }

  if (description) {
    descriptors.push({ property: "og:description", content: description });
    descriptors.push({ name: "twitter:description", content: description });
  }

  if (alternates?.length) {
    descriptors.push(
      ...alternates.map((alternate) =>
        createAlternate(alternate.pathname, domain, alternate.hrefLang)
      )
    );
  }

  if (jsonLd) {
    descriptors.push({ "script:ld+json": jsonLd });
  }

  return descriptors;
};

export const createWebSiteJsonLd = (domain?: string) => {
  const url = toSiteUrl("/", domain);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    name: SITE_NAME,
    url,
  };
};

export const createWebPageJsonLd = ({
  pathname,
  domain,
  title,
  description,
  locale = "en",
  type = "WebPage",
  publishedAt,
  updatedAt,
}: WebPageJsonLdOptions) => {
  const siteUrl = toSiteUrl("/", domain);
  const pageUrl = toSiteUrl(pathname, domain);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${pageUrl}#webpage`,
    name: title,
    description,
    url: pageUrl,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: SITE_NAME,
      url: siteUrl,
    },
    mainEntityOfPage: pageUrl,
  };

  if (type === "Article") {
    jsonLd.headline = title;
  }

  if (publishedAt) {
    jsonLd.datePublished = publishedAt;
  }

  if (updatedAt) {
    jsonLd.dateModified = updatedAt;
  }

  return jsonLd;
};

export const createJsonLdGraph = (...entries: Record<string, unknown>[]) => {
  return {
    "@context": "https://schema.org",
    "@graph": entries.map((entry) => {
      const { "@context": _context, ...rest } = entry;
      return rest;
    }),
  };
};

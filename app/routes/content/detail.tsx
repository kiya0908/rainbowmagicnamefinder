// Detail page shared loader/meta implementation.
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";

import { canIndexContentEntry } from "~/features/content/indexing-policy";
import {
  getAlternateEntry,
  getCollectionEntries,
  getContentEntry,
} from "~/features/content/registry";
import { ContentDetailPage } from "~/features/content/detail-page";
import { parseMarkdown } from "~/features/content/markdown";
import { getContentPath, inferContentContext } from "~/features/content/utils";
import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const pathname = new URL(request.url).pathname;
  const context = inferContentContext(pathname);

  if (!context || !params.slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const entry = getContentEntry(context.locale, context.collection, params.slug);

  if (!entry) {
    throw new Response("Not Found", { status: 404 });
  }

  const alternateEntry = getAlternateEntry(entry);
  const { body: _body, ...entrySummary } = entry;
  const { node } = parseMarkdown(entry.body);
  const relatedEntries = getCollectionEntries(context.locale, context.collection)
    .filter((item) => item.slug !== entry.slug)
    .slice(0, 3);

  return {
    locale: context.locale,
    collection: context.collection,
    entry: entrySummary,
    indexable: canIndexContentEntry(entrySummary),
    node,
    path: entry.path,
    alternatePath: alternateEntry?.path ?? null,
    relatedEntries,
  };
};

export const meta: MetaFunction<typeof loader> = ({ data, matches }) => {
  if (!data) {
    return [{ title: "Not Found" }];
  }

  const rootData = matches[0]?.data as { DOMAIN?: string } | undefined;
  const englishPath = getContentPath("en", data.collection, data.entry.slug);
  const alternateLang = data.locale === "en" ? "zh" : "en";
  const ogType = data.collection === "blog" ? "article" : "website";
  const jsonLdType = data.collection === "blog" ? "Article" : "WebPage";

  return [
    { title: `${data.entry.title}` },
    { name: "description", content: data.entry.description },
    ...createSeoDescriptors({
      pathname: data.path,
      domain: rootData?.DOMAIN,
      title: data.entry.title,
      description: data.entry.description,
      robots: data.indexable ? undefined : "noindex,follow",
      ogType,
      alternates: [
        { pathname: data.path, hrefLang: data.locale },
        ...(data.alternatePath
          ? [{ pathname: data.alternatePath, hrefLang: alternateLang }]
          : []),
        { pathname: englishPath, hrefLang: "x-default" },
      ],
      jsonLd: createWebPageJsonLd({
        pathname: data.path,
        domain: rootData?.DOMAIN,
        title: data.entry.title,
        description: data.entry.description,
        locale: data.locale,
        type: jsonLdType,
        publishedAt: data.entry.publishedAt,
        updatedAt: data.entry.updatedAt,
      }),
    }),
  ];
};

export default function ContentDetailRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <ContentDetailPage
      locale={data.locale}
      collection={data.collection}
      entry={data.entry}
      node={data.node}
      relatedEntries={data.relatedEntries}
      alternatePath={data.alternatePath}
    />
  );
}

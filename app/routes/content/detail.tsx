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
import { createAlternate, createCanonical } from "~/utils/meta";

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
  const domain = rootData?.DOMAIN ?? "https://linkedinspeaktranslator.top";
  const englishPath = getContentPath("en", data.collection, data.entry.slug);
  const alternateLang = data.locale === "en" ? "zh" : "en";

  return [
    { title: `${data.entry.title}` },
    { name: "description", content: data.entry.description },
    ...(!data.indexable
      ? [{ name: "robots", content: "noindex,follow" as const }]
      : []),
    createCanonical(data.path, domain),
    createAlternate(data.path, domain, data.locale),
    ...(data.alternatePath
      ? [createAlternate(data.alternatePath, domain, alternateLang)]
      : []),
    createAlternate(englishPath, domain, "x-default"),
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


// Collection page shared loader/meta implementation.
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";

import { canIndexCollectionPage } from "~/features/content/indexing-policy";
import { ContentCollectionPage } from "~/features/content/collection-page";
import { getCollectionPageData } from "~/features/content/registry";
import {
  getCollectionPath,
  inferContentContext,
} from "~/features/content/utils";
import { createAlternate, createCanonical } from "~/utils/meta";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const pathname = new URL(request.url).pathname;
  const context = inferContentContext(pathname);

  if (!context) {
    throw new Response("Not Found", { status: 404 });
  }

  const { page, entries } = getCollectionPageData(
    context.locale,
    context.collection
  );
  const alternatePath = getCollectionPath(
    context.locale === "en" ? "zh" : "en",
    context.collection
  );

  return {
    locale: context.locale,
    collection: context.collection,
    indexable: canIndexCollectionPage(context.locale, context.collection),
    page,
    entries,
    path: getCollectionPath(context.locale, context.collection),
    alternatePath,
  };
};

export const meta: MetaFunction<typeof loader> = ({ data, matches }) => {
  if (!data) {
    return [{ title: "Not Found" }];
  }

  const rootData = matches[0]?.data as { DOMAIN?: string } | undefined;
  const domain = rootData?.DOMAIN ?? "https://linkedinspeaktranslator.top";
  const englishPath = getCollectionPath("en", data.collection);
  const alternateLang = data.locale === "en" ? "zh" : "en";

  return [
    { title: data.page.title },
    { name: "description", content: data.page.description },
    ...(!data.indexable
      ? [{ name: "robots", content: "noindex,follow" as const }]
      : []),
    createCanonical(data.path, domain),
    createAlternate(data.path, domain, data.locale),
    createAlternate(data.alternatePath, domain, alternateLang),
    createAlternate(englishPath, domain, "x-default"),
  ];
};

export default function ContentCollectionRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <ContentCollectionPage
      page={data.page}
      entries={data.entries}
      alternatePath={data.alternatePath}
    />
  );
}


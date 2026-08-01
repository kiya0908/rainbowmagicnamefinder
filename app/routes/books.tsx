import type { Route } from "./+types/books";

import { BOOK_CATALOG_RECORD_COUNT } from "~/features/fairy-finder/data/book-catalog";
import { BooksPage } from "~/features/fairy-finder/books-page";
import {
  createJsonLdGraph,
  createSeoDescriptors,
  createWebPageJsonLd,
  createWebSiteJsonLd,
} from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Books: 324-Title List & Checklist";
  const description =
    "Browse a printable Rainbow Magic checklist for all 324 official-source cover records in this fan archive, organised with the current publisher catalog.";
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rainbow Magic 324-title archive checklist",
    numberOfItems: BOOK_CATALOG_RECORD_COUNT,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
  };

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "rainbow magic books list, rainbow magic books checklist, rainbow magic reading order",
    },
    ...createSeoDescriptors({
      pathname: "/books",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createJsonLdGraph(
        createWebSiteJsonLd(matches[0]?.data?.DOMAIN),
        createWebPageJsonLd({
          pathname: "/books",
          domain: matches[0]?.data?.DOMAIN,
          title,
          description,
          type: "CollectionPage",
          publishedAt: "2026-07-28",
          updatedAt: "2026-07-28",
        }),
        itemListJsonLd
      ),
    }),
  ];
};

export default BooksPage;

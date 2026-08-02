import type { Route } from "./+types/books";

import {
  BOOK_CATALOG_RECORD_COUNT,
  OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT,
} from "~/features/fairy-finder/data/book-catalog";
import { BooksPage, FAQ_ITEMS } from "~/features/fairy-finder/books-page";
import {
  createJsonLdGraph,
  createSeoDescriptors,
  createWebPageJsonLd,
  createWebSiteJsonLd,
} from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Books List & Printable Checklist";
  const description =
    `Browse all ${OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT} titles in the checked Rainbow Magic publisher catalog, follow each section in order, track what you have read, and print the complete checklist.`;
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rainbow Magic official-catalog books list and checklist",
    numberOfItems: BOOK_CATALOG_RECORD_COUNT,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "rainbow magic books, rainbow magic books list, rainbow magic books checklist, rainbow magic books in order, Rainbow Magic book series",
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
          updatedAt: "2026-08-02",
        }),
        itemListJsonLd,
        faqJsonLd
      ),
    }),
  ];
};

export default BooksPage;

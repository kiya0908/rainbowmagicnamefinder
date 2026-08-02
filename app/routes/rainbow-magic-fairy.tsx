import type { Route } from "./+types/rainbow-magic-fairy";

import {
  FAQ_ITEMS,
  RainbowMagicFairyGuidePage,
} from "~/features/fairy-finder/rainbow-magic-fairy-page";
import {
  createJsonLdGraph,
  createSeoDescriptors,
  createWebPageJsonLd,
  createWebSiteJsonLd,
} from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Fairy Guide: Names, Books & Series";
  const description =
    "Explore all 299 titles in the checked Rainbow Magic publisher catalog by fairy name and series, with 39 catalog sections, book checklists, and practical reading paths.";
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
        "rainbow magic fairy, rainbow magic fairies, rainbow magic fairy series, rainbow magic books",
    },
    ...createSeoDescriptors({
      pathname: "/rainbow-magic-fairy",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createJsonLdGraph(
        createWebSiteJsonLd(matches[0]?.data?.DOMAIN),
        createWebPageJsonLd({
          pathname: "/rainbow-magic-fairy",
          domain: matches[0]?.data?.DOMAIN,
          title,
          description,
          type: "Article",
          publishedAt: "2026-07-28",
          updatedAt: "2026-08-02",
        }),
        faqJsonLd
      ),
      ogType: "article",
    }),
  ];
};

export default RainbowMagicFairyGuidePage;

import type { Route } from "./+types/zh";

import FairyFinderLandingPage from "~/features/fairy-finder/landing-page";
import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Fairy Name Finder - Chinese Entry";
  const description =
    "Chinese entry path for Rainbow Magic Fairy Name Finder. This route stays noindex for search engines, but keeps its own canonical URL on /zh.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/zh",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      robots: "noindex,follow",
      alternates: [
        { pathname: "/", hrefLang: "en" },
        { pathname: "/zh", hrefLang: "zh" },
        { pathname: "/", hrefLang: "x-default" },
      ],
      jsonLd: createWebPageJsonLd({
        pathname: "/zh",
        domain: matches[0]?.data?.DOMAIN,
        title,
        description,
        locale: "zh",
      }),
    }),
  ];
};

export default function ZhHomePage() {
  return <FairyFinderLandingPage />;
}

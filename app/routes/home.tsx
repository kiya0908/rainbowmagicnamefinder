import type { Route } from "./+types/home";

import FairyFinderLandingPage from "~/features/fairy-finder/landing-page";
import {
  createJsonLdGraph,
  createSeoDescriptors,
  createWebPageJsonLd,
  createWebSiteJsonLd,
} from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Fairy Name Finder - Find Your Fairy Name";
  const description =
    "Enter your name and discover your Rainbow Magic fairy name! Free fairy name quiz - find your fairy identity and share with friends.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "rainbow magic fairy name finder, find your rainbow magic fairy name, fairy name quiz, what rainbow magic fairy am i",
    },
    ...createSeoDescriptors({
      pathname: "/",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      alternates: [
        { pathname: "/", hrefLang: "en" },
        { pathname: "/zh", hrefLang: "zh" },
        { pathname: "/", hrefLang: "x-default" },
      ],
      jsonLd: createJsonLdGraph(
        createWebSiteJsonLd(matches[0]?.data?.DOMAIN),
        createWebPageJsonLd({
          pathname: "/",
          domain: matches[0]?.data?.DOMAIN,
          title,
          description,
          locale: "en",
        })
      ),
    }),
  ];
};

export default function HomePage() {
  return <FairyFinderLandingPage />;
}

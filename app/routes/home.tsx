import type { Route } from "./+types/home";

import FairyFinderLandingPage from "~/features/fairy-finder/landing-page";
import { createAlternate, createCanonical } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedinspeaktranslator.top";

  return [
    { title: "Rainbow Magic Fairy Name Finder — Find Your Fairy Name" },
    {
      name: "description",
      content:
        "Enter your name and discover your Rainbow Magic fairy name! Free fairy name quiz — find your fairy identity and share with friends.",
    },
    {
      name: "keywords",
      content:
        "rainbow magic fairy name finder, find your rainbow magic fairy name, fairy name quiz, what rainbow magic fairy am i",
    },
    createCanonical("/", domain),
    createAlternate("/", domain, "en"),
    createAlternate("/zh", domain, "zh"),
    createAlternate("/", domain, "x-default"),
  ];
};

export default function HomePage() {
  return <FairyFinderLandingPage />;
}

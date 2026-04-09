///zh路由
import type { Route } from "./+types/zh";

import LinkedinTranslatorLandingPage from "~/features/linkedin-translator/landing-page";
import { getLinkedinTranslatorRouteMeta } from "~/features/linkedin-translator/i18n";
import { createCanonical } from "~/utils/meta";

const createAlternate = (pathname: string, domain: string, hrefLang: string) => ({
  tagName: "link" as const,
  rel: "alternate",
  hrefLang,
  href: new URL(pathname, domain).toString(),
});

export const meta: Route.MetaFunction = ({ matches }) => {
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedinspeaktranslator.top";
  const routeMeta = getLinkedinTranslatorRouteMeta("zh");

  return [
    { title: routeMeta.title },
    {
      name: "description",
      content: routeMeta.description,
    },
    createCanonical("/zh", domain),
    createAlternate("/", domain, "en"),
    createAlternate("/zh", domain, "zh"),
    createAlternate("/", domain, "x-default"),
  ];
};

export default function ZhHomePage() {
  return <LinkedinTranslatorLandingPage locale="zh" />;
}


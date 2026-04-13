import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";

import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Cookie Policy - Rainbow Magic Fairy Name Finder";
  const description =
    "Learn how Rainbow Magic Fairy Name Finder uses cookies and similar technologies, and how you can manage cookie preferences.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/legal/cookie",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createWebPageJsonLd({
        pathname: "/legal/cookie",
        domain: matches[0]?.data?.DOMAIN,
        title,
        description,
      }),
    }),
  ];
};

export const loader = ({}: Route.LoaderArgs) => {
  const { node } = parseMarkdown(content);
  return { node };
};

export default function Page({ loaderData: { node } }: Route.ComponentProps) {
  return <Legal node={node} withHomeChrome />;
}

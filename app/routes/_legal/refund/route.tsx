import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";

import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Refund Policy - Rainbow Magic Fairy Name Finder";
  const description =
    "Learn why the free Rainbow Magic Fairy Name Finder has no site purchases to refund and what to do about unrecognized charges or third-party purchases.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/legal/refund",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createWebPageJsonLd({
        pathname: "/legal/refund",
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

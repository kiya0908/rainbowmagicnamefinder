import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";

import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Refund Policy - Rainbow Magic Fairy Name Finder";
  const description =
    "Review the Rainbow Magic Fairy Name Finder Refund Policy, including eligibility criteria, request timelines, and refund processing details.";

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

import type { Route } from "./+types/route";

import { Legal } from "~/components/pages/legal";
import { parseMarkdown } from "~/.server/libs/markdown";
import content from "./content.md?raw";

import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Terms of Use - Rainbow Magic Fairy Name Finder";
  const description =
    "Review the Rainbow Magic Fairy Name Finder Terms of Use, including account rules, acceptable use requirements, and legal conditions of service.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/legal/terms",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createWebPageJsonLd({
        pathname: "/legal/terms",
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

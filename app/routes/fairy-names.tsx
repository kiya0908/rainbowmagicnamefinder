import type { Route } from "./+types/fairy-names";

import { FairyNamesPage } from "~/features/fairy-finder/fairy-names-page";
import {
  createJsonLdGraph,
  createSeoDescriptors,
  createWebPageJsonLd,
  createWebSiteJsonLd,
} from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Fairy Names List";
  const description =
    "Browse the Rainbow Magic fairy names list with fairy titles and book cover references from the name finder catalog.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "rainbow magic fairy names, rainbow magic fairy list, rainbow magic fairy titles, fairy name finder list",
    },
    ...createSeoDescriptors({
      pathname: "/fairy-names",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createJsonLdGraph(
        createWebSiteJsonLd(matches[0]?.data?.DOMAIN),
        createWebPageJsonLd({
          pathname: "/fairy-names",
          domain: matches[0]?.data?.DOMAIN,
          title,
          description,
          locale: "en",
          type: "CollectionPage",
        })
      ),
    }),
  ];
};

export default FairyNamesPage;

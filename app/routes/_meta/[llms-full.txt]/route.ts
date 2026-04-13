import type { Route } from "./+types/route";

import { getSiteOrigin } from "~/config/site";
import { buildLlmsFullText } from "~/features/meta/llms";

export const loader = ({ context }: Route.LoaderArgs) => {
  const env =
    context.cloudflare?.env ??
    (typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {});
  const domain = getSiteOrigin(env.DOMAIN);

  return new Response(buildLlmsFullText(domain), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

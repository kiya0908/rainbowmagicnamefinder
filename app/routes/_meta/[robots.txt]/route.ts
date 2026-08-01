import type { Route } from "./+types/route";
import file from "./file.txt?raw";
import { getSiteOrigin } from "~/config/site";

export const loader = ({ context }: Route.LoaderArgs) => {
  const env =
    context.cloudflare?.env ??
    (typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {});
  const domain = getSiteOrigin(env.DOMAIN);

  return new Response(file.replace(/{DOMAIN}/g, domain), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

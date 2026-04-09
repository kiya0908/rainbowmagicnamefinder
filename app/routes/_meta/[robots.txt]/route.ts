import type { Route } from "./+types/route";
import file from "./file.txt?raw";

export const loader = ({ context, request }: Route.LoaderArgs) => {
  const env =
    context.cloudflare?.env ??
    (typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {});
  const DOMAIN = env.DOMAIN ?? new URL(request.url).origin;
  const domain = DOMAIN.endsWith("/") ? DOMAIN.slice(0, -1) : DOMAIN;

  return new Response(file.replace(/{DOMAIN}/g, domain), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

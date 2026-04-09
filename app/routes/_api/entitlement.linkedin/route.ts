import type { Route } from "./+types/route";

import { resolveLinkedinTranslationAccess } from "~/.server/services/linkedin-translator";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const access = await resolveLinkedinTranslationAccess(request);
  const headers = new Headers();

  if (access.cookieHeader) {
    headers.set("Set-Cookie", access.cookieHeader);
  }

  return Response.json(
    {
      entitlement: access.entitlement,
    },
    { headers }
  );
};

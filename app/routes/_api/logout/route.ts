import type { Route } from "./+types/route";
import { getSessionHandler } from "~/.server/libs/session";
import { redirect } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const [session, { destroySession }] = await getSessionHandler(request);

    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
};

export const action = async ({ request }: Route.ActionArgs) => {
    return loader({ request } as any);
};

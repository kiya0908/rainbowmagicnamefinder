import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getSessionHandler } from "~/.server/libs/session";
import { redirect } from "react-router";

const destroyAndRedirect = async (request: Request) => {
    const [session, { destroySession }] = await getSessionHandler(request);

    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
};

export const loader = async ({ request }: LoaderFunctionArgs) =>
  destroyAndRedirect(request);

export const action = async ({ request }: ActionFunctionArgs) =>
  destroyAndRedirect(request);

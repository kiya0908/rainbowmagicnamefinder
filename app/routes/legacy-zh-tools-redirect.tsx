import { redirect } from "react-router";

import type { Route } from "./+types/legacy-zh-tools-redirect";

export const loader = ({}: Route.LoaderArgs) => {
  throw redirect("/", 301);
};

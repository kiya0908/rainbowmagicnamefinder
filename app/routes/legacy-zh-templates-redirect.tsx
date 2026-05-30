import { redirect } from "react-router";

import type { Route } from "./+types/legacy-zh-templates-redirect";

export const loader = ({}: Route.LoaderArgs) => {
  throw redirect("/fairy-names", 301);
};

import { redirect } from "react-router";

import type { Route } from "./+types/legacy-zh-blog-redirect";

export const loader = ({}: Route.LoaderArgs) => {
  throw redirect("/", 301);
};

import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

const apiRoutes: RouteConfig = [
  route("auth", "./routes/_api/auth/route.ts"),
  route("fairy-image", "./routes/_api/fairy-image/route.ts"),
  // Stage 3: keep isolated legacy files but stop mounting runtime entries:
  // - ./routes/_api/credits/route.ts
  // - ./routes/_api/logout/route.ts
  // Stage 5: payment flow is intentionally disabled on this site:
  // - ./routes/_api/create-order/route.ts
  // Stage 6: old translator APIs are physically removed.
];

const metaRoutes = await flatRoutes({ rootDirectory: "./routes/_meta" });
const legalRoutes = await flatRoutes({ rootDirectory: "./routes/_legal" });

export default [
  index("./routes/home.tsx"),
  route("fairy-names", "./routes/fairy-names.tsx"),
  route("zh", "./routes/zh.tsx"),
  route("tools/*", "./routes/legacy-tools-redirect.tsx"),
  route("templates/*", "./routes/legacy-templates-redirect.tsx"),
  route("blog/*", "./routes/legacy-blog-redirect.tsx"),
  route("zh/tools/*", "./routes/legacy-zh-tools-redirect.tsx"),
  route("zh/templates/*", "./routes/legacy-zh-templates-redirect.tsx"),
  route("zh/blog/*", "./routes/legacy-zh-blog-redirect.tsx"),
  ...prefix("base", [
    layout("./routes/base/layout/index.tsx", [
      index("./routes/base/index.tsx"),
      route("profile", "./routes/base/profile.tsx"),
      route("credits", "./routes/base/credits.tsx"),
      // Stage 5: payment account pages are intentionally de-referenced:
      // - ./routes/base/orders.tsx
      // - ./routes/base/subscription.tsx
    ]),
  ]),
  ...prefix("api", apiRoutes),
  // Stage 5: payment callback/webhook routes are intentionally de-referenced:
  // - ./routes/_callback/payment/route.tsx
  // - ./routes/_webhooks/payment/route.ts
  ...prefix("legal", legalRoutes),
  ...metaRoutes,
] satisfies RouteConfig;

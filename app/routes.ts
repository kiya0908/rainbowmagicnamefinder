import { type RouteConfig, layout, prefix, index, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

// 各功能模块路由
const apiRoutes: RouteConfig = [
  route("auth", "./routes/_api/auth/route.ts"),
  route("fairy-image", "./routes/_api/fairy-image/route.ts"),
  // Stage 3: keep isolated legacy files but stop mounting runtime entries:
  // - ./routes/_api/credits/route.ts
  // - ./routes/_api/logout/route.ts
  // Stage 5: payment flow is intentionally disabled on this site:
  // - ./routes/_api/create-order/route.ts
  // Stage 6: linkedin translator APIs are physically removed:
  // - ./routes/_api/translate.linkedin/route.ts
  // - ./routes/_api/entitlement.linkedin/route.ts
];
const metaRoutes = await flatRoutes({ rootDirectory: "./routes/_meta" });
const legalRoutes = await flatRoutes({ rootDirectory: "./routes/_legal" });

export default [
  // 首页 — 独立路由，不经过 BaseLayout
  index("./routes/home.tsx"),
  route("zh", "./routes/zh.tsx"),
  route("tools", "./routes/content/tools.tsx"),
  route("tools/:slug", "./routes/content/tools.$slug.tsx"),
  route("templates", "./routes/content/templates.tsx"),
  route("templates/:slug", "./routes/content/templates.$slug.tsx"),
  route("blog", "./routes/content/blog.tsx"),
  route("blog/:slug", "./routes/content/blog.$slug.tsx"),
  route("zh/tools", "./routes/content/zh.tools.tsx"),
  route("zh/tools/:slug", "./routes/content/zh.tools.$slug.tsx"),
  route("zh/templates", "./routes/content/zh.templates.tsx"),
  route("zh/templates/:slug", "./routes/content/zh.templates.$slug.tsx"),
  route("zh/blog", "./routes/content/zh.blog.tsx"),
  route("zh/blog/:slug", "./routes/content/zh.blog.$slug.tsx"),
  // 其他需要 BaseLayout 的页面
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

# LINKEDIN_TRANSLATOR_CLEANUP_IMPLEMENTATION_LOG

## Stage 1: Reference Cut（低风险断引用）
- 执行日期：2026-04-12

### 阶段目标
- 只做入口断引用，不删文件。
- 停止首页和 sitemap 对 `/zh` 的导流。
- 停止 Fairy 导航对 `/blog` 的导流。
- 下线共享 footer/目录徽章中的 LinkedIn 导流项。

### 文件变更
- `app/routes/home.tsx`
- `app/routes/_meta/[sitemap.xml].tsx`
- `app/features/fairy-finder/i18n.ts`
- `app/features/layout/base-layout/directory-badges.config.ts`

### 已移除或更新的引用
- `app/routes/home.tsx`
  - 移除 `createAlternate("/zh", domain, "zh")`。
- `app/routes/_meta/[sitemap.xml].tsx`
  - 移除默认 sitemap 项中的 `/zh`。
  - 新增过滤：排除 `/zh` 与 `/zh/*` 的 sitemap 输出。
- `app/features/fairy-finder/i18n.ts`
  - Fairy 顶部导航移除 `Blog -> /blog`。
  - Fairy footer 移除 `mailto:support@linkedinspeaktranslator.top` 支持入口。
- `app/features/layout/base-layout/directory-badges.config.ts`
  - 将 `findly.tools/linkedin-translator` 目录徽章改为 `active: false`（下线，不删除配置对象）。

### 有意保留（按本阶段规则不动）
- 标记为 **NEEDS MANUAL VERIFICATION** 的支付相关模块：
  - `app/routes/_api/create-order/route.ts`
  - `app/routes/_callback/payment/route.tsx`
  - `app/routes/_webhooks/payment/route.ts`
  - `app/.server/services/order.ts`
  - `app/.server/constants/product.ts`
  - `app/constants/pricing.ts`
- 文档壳、法务页面、共享基础设施与部署配置：
  - `workers/app.ts`
  - `app/features/document/**`
  - `app/routes/_legal/**`
  - `wrangler.jsonc`
  - `worker-configuration.d.ts`
- Legacy 模块与路由文件本体（仅断引用，未删除）：
  - `/zh` 及 LinkedIn translator 相关文件仍在仓库中。

### 本阶段删除动作
- 未删除任何文件或模块。
- 仅执行断引用与下线开关变更。

### 构建/验证结果
- 本阶段未执行 `pnpm run build` 与 smoke test。
- 原因：按分阶段计划，构建与路由冒烟验证属于 Stage 2（Verification 1）。

### 剩余风险
- `/zh` 与 content 相关 legacy 路由仍可直接访问（只是入口导流减少）。
- `PublicSiteLayout` 与部分法务/内容文案仍带 LinkedIn 品牌耦合。
- 支付/回调/webhook 仍活跃，尚未进入人工核验阶段。

### 建议下一阶段
- 执行 **Stage 2: Verification 1**：
  - 运行 `pnpm run build`
  - 本地 smoke：`/`、`/legal/*`、`/sitemap.xml`、`/robots.txt`
  - 记录仍可访问的 legacy 路径

## Current Cleanup Status
- 当前已完成阶段：
  - Stage 1: Reference Cut（低风险断引用）
  - Stage 2: Verification 1 + Project Identity/Config Update
  - Stage 3: Isolated Removal（低耦合删除）
  - Stage 4: Verification 2（部署兼容验证）
  - Stage 5: Payment De-reference（支付链路下线，本次）
  - Stage 6: Linkedin Translator Physical Removal（模块物理移除，本次）
- 当前策略：保持“先断引用、再物理删除、每步回归验证”。

## Stage 2: Verification 1 + Project Identity/Config Update
- 执行日期：2026-04-12

### 阶段目标
- 执行 Stage 2 计划中的 build 与关键路由 smoke 验证。
- 将项目级身份信息切换为 Rainbow Magic Fairy Name Finder。
- 同步项目级 domain/email/canonical 相关配置与文档，保持改动最小可审查。

### 文件变更
- 项目文档与配置：
  - `README.md`
  - `README.zh-CN.md`
  - `package.json`
  - `wrangler.jsonc`
- 路由与 SEO/域名相关：
  - `app/routes/home.tsx`
  - `app/routes/_meta/[sitemap.xml].tsx`
  - `app/routes/zh.tsx`
  - `app/routes/content/collection.tsx`
  - `app/routes/content/detail.tsx`
- 法务页面与法务 meta：
  - `app/routes/_legal/privacy/route.tsx`
  - `app/routes/_legal/privacy/content.md`
  - `app/routes/_legal/terms/route.tsx`
  - `app/routes/_legal/terms/content.md`
  - `app/routes/_legal/cookie/route.tsx`
  - `app/routes/_legal/cookie/content.md`
  - `app/routes/_legal/acceptable-use/route.tsx`
  - `app/routes/_legal/acceptable-use/content.md`
  - `app/routes/_legal/refund/route.tsx`
  - `app/routes/_legal/refund/content.md`
  - `app/components/pages/legal/index.tsx`
- 共享布局默认身份信息：
  - `app/components/common/logo.tsx`
  - `app/features/layout/base-layout/header.tsx`
  - `app/features/layout/base-layout/marketing-header.tsx`
  - `app/features/layout/base-layout/footer.tsx`
  - `app/features/layout/base-layout/socials.tsx`
  - `app/features/layout/base-layout/public-site-layout.tsx`
  - `app/routes/base/layout/index.tsx`
  - `app/routes/base/credits.tsx`
  - `app/routes/base/orders.tsx`
  - `app/routes/base/profile.tsx`
  - `app/routes/base/subscription.tsx`

### 有意保留（本阶段不动）
- 支付/回调/webhook 与订单状态机（NEEDS MANUAL VERIFICATION）：
  - `app/routes/_api/create-order/route.ts`
  - `app/routes/_callback/payment/route.tsx`
  - `app/routes/_webhooks/payment/route.ts`
  - `app/.server/services/order.ts`
  - `app/.server/constants/product.ts`
  - `app/constants/pricing.ts`
- 共享基础设施与部署核心绑定：
  - `workers/app.ts`
  - `app/features/document/**`
  - `worker-configuration.d.ts`
  - `wrangler` 的 D1/KV binding 结构（仅更新 name/route，不改绑定）
- Legacy 高耦合模块本体：
  - `app/features/linkedin-translator/**`
  - content 系统删除动作（本阶段不做）

### 本阶段验证（Stage 2）
- Build：
  - `pnpm run build` 执行通过（退出码 0）。
- 本地 smoke（提权后完成）：
  - `/`：200，页面包含 `Rainbow Magic Fairy Name Finder`
  - `/legal/privacy`：200，检测到新邮箱
  - `/legal/terms`：200，检测到新品牌名
  - `/legal/cookie`：200
  - `/legal/acceptable-use`：200
  - `/legal/refund`：200
  - `/sitemap.xml`：200，未检测到 `/zh` 条目
  - `/robots.txt`：200，Sitemap 行输出正常
- legal 内容检查（提权后）：
  - privacy/cookie/acceptable-use/refund 页面均检测到 `support@rainbowmagicfairyname.online`

### 仍可访问的 legacy 路径
- `/zh`：200（仍可访问，检测到 legacy 内容）
- `/blog`：200（仍可访问，检测到 legacy 内容）

### 本阶段身份信息更新
- 项目名（Project name）：`Rainbow Magic Fairy Name Finder`
  - `package.json` name 更新为 `rainbow-magic-fairy-name-finder`
- 站点/品牌名（Site/brand name）：
  - README、legal meta、共享 Logo/Header/Footer 默认文案已切换
- 主域名（Primary domain）：
  - `wrangler.jsonc` route pattern 更新为：
    - `rainbowmagicfairyname.online`
    - `www.rainbowmagicfairyname.online`
- 支持邮箱（Support email）：
  - 更新为 `support@rainbowmagicfairyname.online`（README、legal、共享默认链接）
- Canonical base URL：
  - 域名 fallback 与推荐 `DOMAIN` 均切换到 `https://rainbowmagicfairyname.online`

### sitemap/robots/wrangler/readme 变更摘要
- sitemap：
  - 继续保留 Stage 1 的 `/zh` 与 `/zh/*` 过滤。
  - 首页 lastmod 更新为 `2026-04-12`。
- robots：
  - 路由逻辑未改；已验证 `Sitemap: .../sitemap.xml` 输出正常。
- wrangler：
  - 更新 worker `name` 与自定义域名 route。
  - 未改 D1/KV 绑定，保持部署兼容。
- README：
  - 中英文 README 已切换为 Fairy Finder 项目身份与新域名/邮箱。

### 构建/验证结果
- `pnpm run build`：通过（退出码 0）。
- 路由 smoke：关键路径状态码与关键内容检查通过。

### 剩余风险
- `/zh`、`/blog` 等 legacy 路径仍在线（已记录，未做删除）。
- `app/features/linkedin-translator/**` 仍保留旧品牌和旧联系方式（按阶段策略暂不深清理）。
- 构建日志末尾仍出现一次 `X [ERROR] The build was canceled` 文本，但命令退出码为 0，当前未阻断构建结果；建议后续单独排查构建日志来源。
- `wrangler` 域名路由已改为新域名，正式发布前需确认 Cloudflare DNS/Custom Domain 已配置完成。

### 建议下一步
- 进入 Stage 3（Isolated Removal）前，先确认外部流量与依赖：
  - `GET/POST /api/logout`
  - `GET /api/credits`
  - 未使用依赖的分批移除与逐批构建验证

## Stage 3: Isolated Removal（低耦合删除）
- 执行日期：2026-04-12

### 阶段目标
- 处理明确孤立项：`/api/credits`、`/api/logout`、未使用 npm 依赖。
- 优先断引用（de-reference），保留文件本体，不做激进删除。
- 修复 Stage 3 旧单测基线，保证 `test:unit` 可用。

### 文件变更
- `app/routes.ts`
- `package.json`
- `pnpm-lock.yaml`
- `app/features/linkedin-translator/pricing.ts`
- `app/features/linkedin-translator/i18n.ts`

### 已移除或更新的引用
- `app/routes.ts`
  - `apiRoutes` 从 `flatRoutes("./routes/_api")` 改为显式白名单挂载：
    - `/api/auth`
    - `/api/create-order`
    - `/api/translate/linkedin`
    - `/api/entitlement/linkedin`
  - 停止运行时挂载：
    - `./routes/_api/credits/route.ts`
    - `./routes/_api/logout/route.ts`
- `package.json`
  - 移除未使用依赖：
    - `@google/genai`
    - `@ai-sdk/openai`
    - `ai`
    - `google-auth-library`
    - `jszip`
    - `react-compare-slider`
- `app/features/linkedin-translator/pricing.ts`
  - NodeNext 导入扩展名修复：`./i18n.js`
  - 增加兼容导出：`LINKEDIN_TRANSLATOR_PRICING_CARDS`（用于旧单测）
- `app/features/linkedin-translator/i18n.ts`
  - NodeNext 导入扩展名修复：`./config.js`

### 有意保留（本阶段不动）
- 低耦合 API 文件本体（仅断挂载，不删文件）：
  - `app/routes/_api/credits/route.ts`
  - `app/routes/_api/logout/route.ts`
- NEEDS MANUAL VERIFICATION 链路（严格保留）：
  - `app/routes/_api/create-order/route.ts`
  - `app/routes/_callback/payment/route.tsx`
  - `app/routes/_webhooks/payment/route.ts`
  - `app/.server/services/order.ts`
  - `app/.server/constants/product.ts`
  - `app/constants/pricing.ts`
- 部署/法务/文档壳/共享基础设施：
  - `workers/app.ts`
  - `app/features/document/**`
  - `app/routes/_legal/**`
  - `wrangler.jsonc`
  - `worker-configuration.d.ts`

### 本阶段删除动作
- 未删除任何源码文件或模块。
- 执行“去依赖”移除：
  - `package.json` 删除 6 个未使用依赖；
  - `pnpm-lock.yaml` 已同步更新（`pnpm install --lockfile-only --ignore-scripts`）。

### 本阶段验证
- 依赖与构建：
  - `pnpm install --lockfile-only --ignore-scripts`：通过。
  - `pnpm run build`：通过（退出码 0）。
- 单测基线：
  - `pnpm run test:unit`：通过（14/14）。
- 本地路由 smoke（提权 dev，验证后已停止进程）：
  - `GET /`：200
  - `GET /legal/privacy`：200
  - `GET /sitemap.xml`：200
  - `GET /robots.txt`：200
  - `GET /api/credits`：404（符合 Stage 3 预期）
  - `GET /api/logout`：404（符合 Stage 3 预期）
  - `POST /api/logout`：404（符合 Stage 3 预期）
  - `GET /api/auth`：200（仍正常挂载）
  - `POST /api/create-order`：400（路由存在，参数缺失）
  - `GET /api/entitlement/linkedin`：200（仍正常挂载）
  - `POST /api/translate/linkedin`：402（路由存在，受额度/权限限制）

### 仍可访问的 legacy 路径（延续 Stage 2 观察）
- `/zh`：仍在线（本阶段未触碰）
- `/blog`：仍在线（本阶段未触碰）

### 构建/验证结果
- Stage 3 目标项已完成：
  - `/api/credits`、`/api/logout` 已下线为 404；
  - 未使用依赖已移除并完成 lockfile 同步；
  - 旧单测基线恢复可用。
- 备注：
  - `pnpm run build` 末尾仍可能打印 Cloudflare/Vite 插件 `WebSocket is undefined` 日志，但命令退出码为 0，当前不阻断构建。

### 剩余风险
- 若外部仍有历史流量访问 `/api/credits` 或 `/api/logout`，将直接收到 404，需要发布后观察日志。
- `/zh`、`/blog` 与 LinkedIn translator 高耦合模块仍在线，尚未进入深度清理。
- 支付/callback/webhook 链路仍在，仍需人工核验后再考虑 Stage 5。

### 建议下一阶段
- 进入 **Stage 4: Verification 2（部署兼容验证）**：
  - `pnpm run build` + `pnpm run typecheck`
  - Cloudflare dev/preview 关键路由验证
  - 核查 webhook/callback 的外部依赖与访问情况，再决定是否推进 Stage 5

## Stage 4: Verification 2（部署兼容验证）
- 执行日期：2026-04-12

### 阶段目标
- 在 Stage 3 后执行部署兼容验证：`build`、`typecheck`、Cloudflare preview 关键路由检查。
- 核查 callback/webhook 是否仍依赖外部支付链路，并记录风险，不做高耦合删除。

### 文件变更
- `app/routes/_api/credits/route.ts`
- `app/routes/_api/logout/route.ts`
- `LINKEDIN_TRANSLATOR_CLEANUP_IMPLEMENTATION_LOG.md`

### 有意保留（本阶段不动）
- 支付与订单状态机（NEEDS MANUAL VERIFICATION）：
  - `app/routes/_api/create-order/route.ts`
  - `app/routes/_callback/payment/route.tsx`
  - `app/routes/_webhooks/payment/route.ts`
  - `app/.server/services/order.ts`
  - `app/.server/libs/creem/**`
- Stage 3 下线策略保持不变：
  - `/api/credits`、`/api/logout` 继续保持“文件保留 + 路由不挂载”

### 本阶段验证
- 构建与类型检查：
  - `pnpm run build`：通过（退出码 0）。
  - `pnpm run typecheck`：通过（退出码 0）。
- Cloudflare preview（提权）关键路由：
  - `GET /`：200
  - `GET /legal/privacy`：200
  - `GET /sitemap.xml`：200
  - `GET /robots.txt`：200
  - `GET /callback/payment`：200（无签名参数时进入失败态页面）
  - `GET /webhooks/payment`：400（无 loader，符合 action-only 资源路由预期）
  - `POST /webhooks/payment`（无 `creem-signature`）：400
  - `GET /api/credits`：404（Stage 3 下线保持生效）
  - `GET /api/logout`：404（Stage 3 下线保持生效）
  - `GET /api/auth`：200
  - `POST /api/create-order`：400（路由存在，参数缺失）
  - `GET /api/entitlement/linkedin`：200
  - `POST /api/translate/linkedin`：402（路由存在，受额度/权限限制）

### callback/webhook 外部依赖核查
- `app/routes/_callback/payment/route.tsx`
  - 仍使用 `createCreem().createCallbackSignature(...)` 校验签名；
  - 仍调用 `handleOrderComplete(...)` 写入订单完成状态。
- `app/routes/_webhooks/payment/route.ts`
  - 仍依赖请求头 `creem-signature` 与 `createWebhookSignature(body)`；
  - 仍调用 `handleOrderComplete/handleOrderRefund/handleSubscription*`。
- `app/.server/libs/creem/index.ts`
  - 生产环境使用 `env.CREEM_KEY` + `env.CREEM_WEBHOOK_SECRET` 访问 `https://api.creem.io`；
  - 本地使用 `env.CREEM_TEST_KEY` + `env.CREEM_WEBHOOK_SECRET` 访问 `https://test-api.creem.io`。
- preview 运行日志已观测到：
  - callback 与 webhook 在无签名条件下均报 `Invalid Signature`，说明签名链路仍在生效。

### 兼容性修复（Stage 4 过程中发现并修复）
- 问题：
  - Stage 3 下 `/api/credits`、`/api/logout` 不再挂载后，不会生成 `./+types/route`，导致 `typecheck` 失败。
- 处理：
  - `app/routes/_api/credits/route.ts`：改用 `LoaderFunctionArgs`。
  - `app/routes/_api/logout/route.ts`：改用 `LoaderFunctionArgs/ActionFunctionArgs`，提取共享 `destroyAndRedirect`。
- 结果：
  - 保持“去挂载不删文件”策略不变，同时恢复类型检查通过。

### 构建/验证结果
- Stage 4 验证完成，未发现阻塞上线的新增错误。
- 记录到的兼容性提示：
  - Wrangler 本地 runtime 对 `compatibility_date = 2026-03-23` 回退到 `2025-05-25`（本地预览告警，建议后续升级 wrangler 再复验）。

### 剩余风险
- callback/webhook 仍深度依赖 Creem 与订单状态机，暂不具备安全删除条件。
- 当前 preview 脚本会经由 `pnpm run preview` 调起 `wrangler dev --local`，端口参数最终落在 Wrangler 默认端口（8787），后续可单独整理脚本参数透传。
- `/zh`、`/blog` 和 LinkedIn 高耦合模块仍在线，未进入 Stage 5。

### 建议下一阶段
- 进入 **Stage 5: Deep Cleanup（高耦合模块）** 前，先做人工确认：
  - 线上是否仍有 `/callback/payment`、`/webhooks/payment`、`/api/create-order` 的真实流量；
  - Creem webhook/回调是否仍在控制台配置并实际触发；
  - 如确认不再需要支付链路，再制定分批下线与回滚预案。

## Stage 5: Payment De-reference（支付链路下线）
- 执行日期：2026-04-12

### 阶段目标
- 基于“网站不接入支付”的新决策，下线支付相关入口与路由挂载。
- 保持“优先断引用、不删文件”的策略，避免一次性高风险删除。
- 保证构建、类型检查与本地 preview 兼容性。

### 文件变更
- `app/routes.ts`
- `app/routes/_api/create-order/route.ts`
- `app/routes/_callback/payment/route.tsx`
- `app/routes/_webhooks/payment/route.ts`
- `app/routes/base/layout/components/sidebar.tsx`
- `app/routes/base/layout/index.tsx`
- `app/routes/base/profile.tsx`
- `app/routes/base/credits.tsx`
- `app/routes/base/orders.tsx`
- `app/routes/base/subscription.tsx`
- `app/features/linkedin-translator/landing-page.tsx`
- `app/features/linkedin-translator/translation-interface.tsx`
- `LINKEDIN_TRANSLATOR_CLEANUP_IMPLEMENTATION_LOG.md`

### 已移除或更新的引用
- `app/routes.ts`
  - `apiRoutes` 中移除 `create-order` 挂载。
  - 移除 `callback/*` 与 `webhooks/*` 前缀挂载。
  - 移除 `base/orders` 与 `base/subscription` 挂载。
  - 对应文件仅“断引用”，未删除本体。
- `app/routes/base/layout/components/sidebar.tsx`
  - 去掉 `Orders`、`Subscription` 入口。
- `app/routes/base/layout/index.tsx`
  - Base 区域顶部导航去掉 `Pricing` 入口。
- `app/routes/base/profile.tsx`
  - 已登录用户动作从 `Subscription status` 改为 `Credit history`。
- `app/routes/base/credits.tsx`
  - 去掉“购买/定价”导向文案，改为中性“返回首页”。
- `app/features/linkedin-translator/landing-page.tsx`
  - 支付价格区块改为 `showPricing = false`（默认不展示）。
- `app/features/linkedin-translator/translation-interface.tsx`
  - Extreme 锁定时锚点从 `#pricing` 改为 `#faq`。

### 有意保留（本阶段不动）
- 支付与订单链路文件本体（仅去入口）：
  - `app/routes/_api/create-order/route.ts`
  - `app/routes/_callback/payment/route.tsx`
  - `app/routes/_webhooks/payment/route.ts`
  - `app/.server/services/order.ts`
  - `app/.server/libs/creem/**`
- 部署、法务与共享基础设施：
  - `workers/app.ts`
  - `wrangler.jsonc`（仅保留现状，不做支付变量删改）
  - `app/routes/_legal/**`
  - `app/features/document/**`

### 本阶段删除动作
- 未删除任何文件。
- 全部为入口断引用、导航收口和类型兼容修复。

### 本阶段验证
- `pnpm run build`：通过（退出码 0）。
- `pnpm run typecheck`：通过（退出码 0）。
- Cloudflare preview（提权）路由检查：
  - `GET /`：200
  - `GET /legal/privacy`：200
  - `GET /sitemap.xml`：200
  - `GET /robots.txt`：200
  - `GET /zh`：200
  - `POST /api/create-order`：404
  - `GET /callback/payment`：404
  - `POST /webhooks/payment`：404
  - `GET /base/orders`：404
  - `GET /base/subscription`：404
  - `GET /api/auth`：200
  - `GET /api/entitlement/linkedin`：200

### 构建/验证结果
- 支付链路主入口已下线，核心站点路由与现有 API 保持可用。
- 预期中的 “No route matches …” 日志仅出现在主动探测已下线路由时，不影响服务可用性。

### 剩余风险
- `app/features/linkedin-translator/i18n.ts` 仍保留部分支付相关文案（虽入口已隐藏）。
- 支付实现代码和 Creem 依赖仍在仓库内（仅断引用，未物理清理）。
- 本地 preview 仍有 Wrangler 兼容日期回退告警（`2026-03-23 -> 2025-05-25`）。

### 建议下一阶段
- 若你确认要彻底移除支付能力，可进入“支付代码物理清理”阶段：
  - 删除未再引用的支付 route/service/model 常量链路；
  - 清理 Creem 相关环境变量与文档；
  - 逐步执行 build/typecheck/preview 回归，确保无残留引用。

## Stage 6: Linkedin Translator Physical Removal（模块物理移除）
- 执行日期：2026-04-12

### 阶段目标
- 在 Stage 5 已断入口的前提下，物理删除 `app/features/linkedin-translator/**`。
- 保持“先去引用再删除”的顺序，避免构建/类型链路断裂。
- 保留部署兼容、法务页面、文档壳和共享基础设施。

### 文件变更
- 入口与布局去耦：
  - `app/routes.ts`
  - `app/routes/zh.tsx`
  - `app/features/layout/base-layout/public-site-layout.tsx`
  - `app/components/pages/legal/index.tsx`
- 服务端与常量兼容：
  - `app/.server/constants/product.ts`
- 测试基线：
  - `tests/unit/index.test.ts`
  - `tsconfig.tests.json`
- 删除文件：
  - `app/features/linkedin-translator/access.ts`
  - `app/features/linkedin-translator/config.ts`
  - `app/features/linkedin-translator/i18n.ts`
  - `app/features/linkedin-translator/landing-page.tsx`
  - `app/features/linkedin-translator/pricing.ts`
  - `app/features/linkedin-translator/translation-interface.tsx`
  - `app/routes/_api/translate.linkedin/route.ts`
  - `app/routes/_api/entitlement.linkedin/route.ts`
  - `app/.server/services/linkedin-translator.ts`
  - `app/.server/services/linkedin-translation-provider.ts`

### 已移除或更新的引用
- `app/routes.ts`
  - 移除 `translate/linkedin` 与 `entitlement/linkedin` API 挂载。
  - 保留 `/zh` 路由，但改为 Fairy 首页别名。
- `app/routes/zh.tsx`
  - 不再引用 LinkedIn landing 与 i18n，改为渲染 `FairyFinderLandingPage`。
  - 设置 canonical 到 `/`，并加 `noindex,follow` 避免重复索引。
- `app/features/layout/base-layout/public-site-layout.tsx`
  - 移除对 `~/features/linkedin-translator/i18n` 的依赖。
  - 改为项目内静态 copy（en/zh 导航与 footer 文案）。
- `app/components/pages/legal/index.tsx`
  - 移除 `LinkedinTranslatorLocale` 类型依赖，改为本地 `en | zh`。
- `tests/unit/index.test.ts` / `tsconfig.tests.json`
  - 移除对已删除 translator 模块的单测与编译入口。

### 有意保留（本阶段不动）
- 支付与订单链路文件（已下线入口但保留本体）：
  - `app/routes/_api/create-order/route.ts`
  - `app/routes/_callback/payment/route.tsx`
  - `app/routes/_webhooks/payment/route.ts`
  - `app/.server/services/order.ts`
  - `app/.server/libs/creem/**`
- 法务、文档壳、部署核心与共享基础设施：
  - `app/routes/_legal/**`
  - `app/features/document/**`
  - `workers/app.ts`
  - `wrangler.jsonc`
  - `worker-configuration.d.ts`
- content 路由与内容系统（本阶段未做深清理）：
  - `app/routes/content/**`
  - `app/features/content/**`
  - `app/content/**`

### 本阶段删除动作
- 已执行物理删除：`app/features/linkedin-translator/**` 整个目录。
- 同步删除已无入口且仅服务该目录的 API/服务端文件（translate/entitlement 及其 server service）。

### 构建/验证结果
- `pnpm run build`：通过（退出码 0）。
- `pnpm run typecheck`：通过（退出码 0）。
- `pnpm run test:unit`：通过（6/6）。

### 剩余风险
- Cloudflare 环境变量与类型声明仍保留 `LINKEDIN_TRANSLATOR_*` 命名，建议后续统一改名或清理。
- `app/.server/services/order.ts` 仍有 `source: "linkedin-translator"` 历史标识，仅属文案/追踪字段残留。
- `app/content/**` 仍有 LinkedIn 主题内容（本阶段未清）。
- `/zh` 当前是 Fairy 首页别名且 `noindex`，如果后续要做真正中文首页，需要单独实现。

### 建议下一阶段
- Stage 7: Legacy Naming & Infra Cleanup（低风险）
  - 清理 `LINKEDIN_TRANSLATOR_*` 环境变量与类型声明残留；
  - 统一历史埋点/文案中的 `linkedin-translator` 标识；
  - 按需评估 content 系统是否保留或分批下线。

## Rollback / Debugging Notes
- 本阶段关键调试记录：
  - 沙箱内执行 `pnpm run dev` / `wrangler dev` 遇到 `spawn EPERM`，已通过提权完成本地 smoke。
  - 本地 smoke 脚本执行后已自动停止 dev 进程。
- Stage 3 补充：
  - `pnpm run test:unit` 初次失败，原因是 NodeNext 导入扩展名与旧测试导出名不一致，已通过最小兼容修复恢复基线。
  - 提权阶段启动的临时 dev 进程已手动停止（PID 27636）。
- Stage 4 补充：
  - `pnpm run preview` 在沙箱内触发 `spawn EPERM`，已通过提权完成 Cloudflare preview 验证。
  - 提权过程中残留的 preview 进程树（PID 9820）已手动终止并确认端口释放。
- Stage 5 补充：
  - 追加支付下线路由验证时，再次触发 preview 进程残留，已手动清理（PID 31860 进程树）。
  - 已确认本地 `8787` 端口释放，临时日志文件已删除。
- Stage 6 补充：
  - `test:unit` 首次失败，原因是 NodeNext 下 `~` 别名在测试编译配置里解析差异；已将 `product.ts` 调整为显式 `.js` 相对导入并恢复通过。
  - 已确认 `app/features/linkedin-translator` 目录与其关联 API/service 文件均已物理删除。
- 若需要快速回滚本阶段：
  - 仅回滚文档/配置：`README.md`、`README.zh-CN.md`、`package.json`、`wrangler.jsonc`
  - 仅回滚法务身份文案：`app/routes/_legal/**` 与 `app/components/pages/legal/index.tsx`
  - 仅回滚共享默认身份信息：`app/components/common/logo.tsx`、`app/features/layout/base-layout/**`、`app/routes/base/**`
  - 仅回滚 Stage 3 路由下线：`app/routes.ts`
  - 仅回滚 Stage 3 依赖收敛：`package.json`、`pnpm-lock.yaml`
  - 仅回滚 Stage 3 单测兼容修复：`app/features/linkedin-translator/pricing.ts`、`app/features/linkedin-translator/i18n.ts`
  - 仅回滚 Stage 4 类型兼容修复：`app/routes/_api/credits/route.ts`、`app/routes/_api/logout/route.ts`
  - 仅回滚 Stage 5 支付下线：`app/routes.ts`、`app/routes/base/layout/components/sidebar.tsx`、`app/routes/base/layout/index.tsx`、`app/routes/base/profile.tsx`、`app/routes/base/credits.tsx`、`app/features/linkedin-translator/landing-page.tsx`、`app/features/linkedin-translator/translation-interface.tsx`
  - 仅回滚 Stage 6 物理删除与去耦：`app/routes.ts`、`app/routes/zh.tsx`、`app/features/layout/base-layout/public-site-layout.tsx`、`app/components/pages/legal/index.tsx`、`app/.server/constants/product.ts`、`tests/unit/index.test.ts`、`tsconfig.tests.json`，并恢复删除文件：`app/features/linkedin-translator/**`、`app/routes/_api/translate.linkedin/route.ts`、`app/routes/_api/entitlement.linkedin/route.ts`、`app/.server/services/linkedin-translator.ts`、`app/.server/services/linkedin-translation-provider.ts`

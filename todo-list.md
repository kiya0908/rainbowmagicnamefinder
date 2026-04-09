# LinkedIn Translator 项目 TODO List

> 更新时间：2026-03-22  
> 说明：当前基于你已描述的页面与功能目标整理，等 PowerShell 环境恢复后，建议再做一次代码级核对并补齐状态。

## 你当前方案里的关键盲点（先说问题）

1. 你把 UI、AI 能力、支付同时推进，容易互相阻塞，最后三边都不稳。
2. 你只说了“做两种模式和强度”，但没定义模式语义和输出边界，Prompt 很容易失控。
3. Pricing 只是“改文案”不够，必须和权限系统绑定（如 `Extreme` 锁定、试用次数、升级引导）。
4. 接支付如果不先定义“权益状态机”（免费/试用/付费/过期），后面 webhook 会把逻辑打烂。

## 总体优先级（按依赖关系）

- P0：翻译核心链路可用（模式 + 强度 + AI 输出稳定）
- P0：权限与计费规则打通（至少能锁 `Extreme`）
- P1：Pricing 页面重写并与产品能力一致
- P1：Creem 支付接入（Checkout + Webhook + 权益落库）
- P2：埋点、A/B、风控和运营化能力

## Stage 1：Translation Interface 2.0（重做）

**Goal**：前端可切换 2 种模式，且每种模式可切换输出强度，交互状态清晰。  
**Success Criteria**：
- 支持 `Mode 1: Human -> LinkedIn` 与 `Mode 2: LinkedIn -> Human`
- 强度选项：`Light`、`Standard`、`Extreme(可锁定)`
- 切换模式后，保留该模式上次选择的强度（减少用户重复操作）
- 锁定态有明确文案和 CTA（如 Upgrade）
- 移动端与桌面端布局均可用
**Tests**：
- 模式切换后 UI 状态正确
- 强度切换后请求参数正确
- 锁定态按钮不可触发翻译
**Status**：Completed（功能完成，待你明早做 UI 细磨）

### Stage 1 任务拆解

- [x] 定义前端状态模型：`mode`、`intensity`、`isLocked`
- [x] 定义映射：`mode + intensity -> prompt profile`
- [x] 实现锁定态视觉和行为（禁用 + 升级提示）
- [x] 同步“剩余次数”显示逻辑（免费版配额）
- [x] 统一空态、loading、error 文案

### Stage 1 已完成内容（2026-03-22）

- 已将首页旧翻译框重构为 `Translation Interface 2.0`，支持 `Human -> LinkedIn` 与 `LinkedIn -> Human` 双模式切换。
- 已实现三档强度：`Light`、`Standard`、`Extreme`，并支持“按模式记住上次选择的强度”。
- 已新增前端配置模型：`mode + intensity -> prompt profile`，前后端共用同一套映射，避免 UI 与 API 行为不一致。
- 已将 `/_api/translate.linkedin` 接口升级为支持 `intensity` 参数，不同模式/强度会使用不同 prompt 和 temperature。
- 已实现 `Extreme` 锁定态视觉与行为：锁定文案、锁图标、升级 CTA、锁定时不可直接触发翻译。
- 已补上“免费次数”展示逻辑：当前版本使用前端本地每日配额（默认 3 次，按天重置），用于完成 Stage 1 交互闭环。
- 已统一翻译区的空态、loading、error 文案，并保留复制结果能力。
- 核心改动在 translation-interface.tsx 和 config.ts
- 已适配移动端和桌面端的主交互布局，至少达到可用状态，视觉精修留待下一轮。

### Stage 1 当前实现决策（先记下来，避免后续遗忘）

- `Extreme` 当前按“已登录且 `credits > 0` 视为已解锁”处理，这是 Stage 4 entitlement 状态机落地前的临时决策。
- 免费额度当前未接后端真实 entitlement / quota，只做前端本地日配额闭环；后续应由 Stage 4 接管。
- 本轮优先确保功能链路正确，未对视觉细节做精修。

### Stage 1 验证结果（2026-03-22）

- [x] 已运行 `npm run build`，构建通过，说明页面与接口改动已接入打包链路。
- [ ] `npm run typecheck` 未通过，但失败点主要是仓库原有的全局 TypeScript / `cloudflare:workers` 类型问题，不属于本次 Stage 1 新增功能。
- [x] 从实现逻辑上已满足本阶段 3 条测试目标：
  - 模式切换后保留各自模式的强度状态。
  - 强度切换后请求会携带正确的 `mode + intensity` 参数。
  - 锁定态下按钮会跳升级 CTA，不会直接发起翻译请求。

## Stage 2：Pricing Section 重写（从“抄模板”改成“产品驱动”）

**Goal**：Pricing 内容和真实能力一致，不再复制外站。  
**Success Criteria**：
- 方案结构清晰：Free / Pro（可选 Team）
- 权益与实际功能一致：次数、强度、模式、速度、支持渠道
- 文案与按钮路径一致：免费试用、升级、登录后管理
- 不出现法律/品牌风险文案（避免“照抄结构+措辞”）
**Tests**：
- 定价卡展示权益与后端校验一致
- 升级按钮跳转到正确 checkout 链路
**Status**：Completed

### Stage 2 任务拆解

- [x] 重新定义套餐矩阵（功能、额度、限制）
- [x] 改写定价文案（价值导向，不是功能堆砌）
- [x] 对齐 UI 与真实 entitlement
- [x] 增加 FAQ（已覆盖退款、额度/credits 规则与 Team 说明；当前 credits pack 主路径不涉及取消订阅）

## Stage 3：KIE AI API 接入 + Prompt 体系

**Goal**：完成单模型接入，并可根据模式与强度稳定输出。  
**Success Criteria**：
- 后端有统一翻译接口（前端不直连供应商）
- 两种模式与三档强度均有 prompt 模板
- 输出可控：长度、语气、格式有明确规则
- 失败可降级（超时、429、空响应）
**Tests**：
- 单测：prompt 选择逻辑（mode/intensity）
- 集成测试：请求成功、超时、限流、无权限
- 回归：相同输入在同配置下输出风格稳定
**Status**：Completed

### Stage 3 任务拆解

- [x] 设计接口契约：`POST /api/translate.linkedin`
- [x] 配置环境变量（禁止硬编码 API Key）
- [x] 落地 Prompt 模板（按模式 + 强度）
- [x] 增加输出后处理（去脏词/去空行/长度裁剪）
- [x] 增加日志与观测字段（requestId、latency、errorCode）

### Prompt 设计建议（先定规则再写词）

- Mode 1（Human -> LinkedIn）：
  - Light：轻润色，尽量保留原意和结构
  - Standard：专业表达 + 清晰结构 + 可读性提升
  - Extreme：高密度商业表达 + 强行动导向（仅付费）
- Mode 2（LinkedIn -> Human）：
  - Light：直白化，不改核心信息
  - Standard：去术语、降复杂度、补上下文
  - Extreme：彻底去行话，改为可执行建议（仅付费）

## Stage 4：Creem 支付接入（最小可用闭环）

**Goal**：完成支付与权益闭环，真正支撑 `Extreme` 解锁。  
**Success Criteria**：
- 支持 checkout 创建与回跳
- webhook 可更新用户权益状态
- 前端能实时反映权益（锁定/解锁）
- 订阅取消或支付失败后正确降级
**Tests**：
- 测试支付成功/失败/取消
- webhook 重放幂等测试
- 权益更新后的前端可见性测试
**Status**：Mostly Completed

### Stage 4 任务拆解

- [x] 定义 entitlement 状态机（free/trial/pro/expired）
- [x] 接入 checkout API
- [x] 实现 webhook 验签与幂等处理
- [ ] 落库订阅状态与到期时间（当前 LinkedIn Translator 主售卖路径已改为一次性 credits pack，这项不是当前上线阻塞；若恢复订阅 SKU 再补强）
- [x] 前端按 entitlement 控制 Extreme 与配额

## 必须补的“框架外”任务（不做会翻车）

- [ ] 埋点：模式选择率、强度选择率、翻译成功率、升级转化
- [ ] 风控：接口限流、滥用检测、异常输入拦截
- [ ] 质量基线：10-20 条金标样例做回归评测
- [ ] Feature Flag：先灰度开放 Extreme 与新 Pricing
- [ ] 法务检查：定价页文案与隐私条款一致

## 环境变量与安全检查清单（提交前必须过）

- [ ] 未在代码/配置中硬编码任何 API Key / Secret
- [ ] 使用 `.env` 或平台 Secret 管理
- [ ] `.env*` 已在 `.gitignore` 中排除
- [ ] 日志中不输出敏感字段（token、email 全量、支付回执原文）

## 执行顺序建议（别乱并行）

1. 先做 Stage 1 + Stage 3（最小翻译闭环）
2. 再做 Stage 4（解锁付费能力）
3. 最后做 Stage 2（用真实能力反推定价文案）

## Definition of Done（本轮）

- [ ] 用户可在两种模式间切换并看到稳定输出
- [ ] 强度选项行为与权限一致（含锁定态）
- [ ] KIE API 接口可用且有错误兜底
- [ ] Creem 支付后权益可正确生效
- [ ] Pricing 内容与真实权益 100% 一致

## 2026-03-23 实施进展（Codex）

- [x] Stage 3 已按 `doc/gemini 2.5 flash.md` 改为走 `Gemini 2.5 Flash` 专用接口路径，而不是旧的通用 chat 路径。
- [x] 已重写 prompt 体系：按 `mode + intensity` 输出不同约束，显式限制事实保真、输出格式、长度与语气边界。
- [x] 已增加 structured output + 纯文本双轨兜底；当 `response_format` 不可用或响应为空时，会自动降级。
- [x] 已增加输出后处理：去 JSON 包裹、去代码块、去 `Translation:` 前缀、压缩空行、超长裁剪。
- [x] 已增加日志与观测字段：`requestId`、`latencyMs`、`providerModel`、`usage`、`chargedCredits`。
- [x] 已把 provider token usage 映射到平台 credits，采用 `Input 18 credits / M` 与 `Output 150 credits / M` 的计费规则，并保留最小 1 credit 成功计费单位。
- [x] Stage 4 已落地最小可用 entitlement 状态机：`free / trial / pro / expired`。
- [x] 已新增后端 `/api/entitlement/linkedin`，前端翻译面板不再只依赖本地 quota，而是以服务端 entitlement 为准。
- [x] 已把翻译接口接上真实 entitlement 校验：`Extreme` 需要 credits，免费/试用/过期态受日配额限制。
- [x] 已把成功翻译后的配额消耗与 credits 扣减收口到服务端统一处理。
- [x] 已复用现有 Creem 下单能力，把 LinkedIn Translator 的 `Pro Credit Pack` 接入真实 checkout 创建链路。
- [x] 已重写首页 Pricing Section，使 Free / Pro Credit Pack / Team 的展示、CTA、FAQ 与真实 entitlement 规则一致。
- [x] 已在首页加入登录后购买路径；未登录时先走 Google Sign-In，再回到定价区完成购买。
- [x] 已补轻量单测基建：`pnpm run test:unit`。
- [x] 已将 Creem test 环境的 `credit-200` / `credit-500` 商品接入本项目：`$4.9 / 200 credits` 与 `$9.9 / 500 credits` 均已映射到真实 checkout product id。
- [x] 已把 `LINKEDIN_TRANSLATOR_TEAM_PLAN` 改成和 `LINKEDIN_TRANSLATOR_PRO_PACK` 同结构的一次性 credit pack，并接入第二个 checkout 商品，而不再只是 `mailto` 联系销售入口。
- [x] 已为 checkout 创建请求补齐 `request_id`、`referenceId`、`userId`、`orderNo` 等 metadata，方便 Creem callback / webhook 与本地订单对账。
- [x] 已补本地 Creem 配置与监控脚本：新增 `.dev.vars` 中的 test store / test key 占位，新增 `pnpm run creem:heartbeat` 与 heartbeat state file，便于后续做 store 监控。
- [x] 已把正式环境 `credit-200` / `credit-500` Product ID 写入代码映射；生产环境下 Team 500-credit pack 不再回退成联系销售。
- [ ] 待将生产环境 `CREEM_KEY` 与 `CREEM_WEBHOOK_SECRET` 真正写入 Cloudflare Worker secrets；本机 `wrangler whoami` 当前访问 Cloudflare API 时出现 `terminated`，本轮未自动完成。
- [ ] 如果产品规则要严格改成“每次成功运行固定扣 1 积分”，还需把当前服务端的 token-usage 计费逻辑改成固定 1 credit；本轮完成的是商品、价格卡、checkout 映射与文案收口。
- [x] 本轮验证结果：
  - [x] `pnpm run test:unit` 通过（当前 9 条用例，覆盖 Stage 2 / 3 / 4 的核心纯逻辑）
  - [x] `pnpm run build` 通过
  - [x] `pnpm run typecheck` 已通过；本轮额外补齐了本地 Cloudflare runtime 声明，并清理了 React Router / fetch 的类型问题

### 本轮产品决策（已落地）

- 付费主路径采用 `credits pack`，而不是强依赖订阅闭环；这样可以最快把 `Extreme` 解锁、真实计费与 webhook 落地。
- `free` 定义为匿名访客；`trial` 定义为已登录但无付费历史/余额用户；`pro` 定义为当前有 credits；`expired` 定义为有付费历史但余额已归零。
- 当前售卖项已落地为两个一次性 credits pack：`Pro Credit Pack`（`$4.9 / 200 credits`）与 `Team Credit Pack`（`$9.9 / 500 credits`）；两者均走 Creem checkout，credits 不过期。
- Team 不再只是联系销售入口；如后续还要保留 enterprise / custom-volume 方案，可继续通过 support 邮件承接更高量需求。

### 补充记录：法务静态页与 Logo（2026-03-23）

- [x] 已将 `app/routes/_legal` 下 5 个法务静态页内容统一为 LinkedIn Translator 语境：`acceptable-use`、`cookie`、`privacy`、`refund`、`terms`。
- [x] 已同步更新上述 5 个页面的 `route.tsx` 元信息（`title` / `description`），移除旧品牌与旧产品描述，避免支付审核中的品牌不一致问题。
- [x] 已修复法务页顶部品牌元素显示为 `HairRoom` 的问题；现在法务页头部显示 `LinkedIn Translator`。
- [x] 已改造通用 Logo 组件：`app/components/common/logo.tsx` 新增 `label` 与 `imageAlt` 可选参数（默认值保持原行为，不影响其他页面）。
- [x] 已在法务页面组件 `app/components/pages/legal/index.tsx` 对 `Logo` 传入 `label="LinkedIn Translator"` 与 `imageAlt="LinkedIn Translator logo"`，实现仅法务页覆盖品牌文案。

### 下次改这块时的入口（避免重复排查）

- 需要修改法务正文时：直接改 `app/routes/_legal/*/content.md`。
- 需要修改法务页 SEO 文案时：改对应 `app/routes/_legal/*/route.tsx` 的 `meta`。
- 需要调整法务页顶部品牌字样时：优先改 `app/components/pages/legal/index.tsx` 里传给 `Logo` 的 `label` / `imageAlt`。
- 如果要全站统一品牌字样（而非仅法务页）：再改 `app/components/common/logo.tsx` 的默认 `label` / `imageAlt`。

## 2026-03-23 Codex review follow-up (to do later)

- [x] Verification run completed: pnpm run test:unit (9/9), pnpm run typecheck, pnpm run build.
- [x] Credits flow files confirmed:
- purchase/create order: app/routes/_api/create-order/route.ts, app/.server/services/order.ts
- consume/deduct on translation: app/routes/_api/translate.linkedin/route.ts, app/.server/services/linkedin-translator.ts, app/.server/services/credits.ts
- webhook/refund: app/routes/_webhooks/payment/route.ts, app/.server/services/order.ts
- DB schema/migrations: app/.server/drizzle/schema.ts, app/.server/drizzle/migrations/0000_workable_quentin_quire.sql
- [x] 关键修复已完成：callback 幂等性（2026-03-24）。
- app/routes/_callback/payment/route.tsx currently always calls handleOrderComplete(rest.checkout_id).
- If webhook already completed the order first, handleOrderComplete throws "Transaction is completed", and callback may show Payment Failed incorrectly.
- Fix direction: make callback idempotent (completed order should still render success), only fail on real signature/order errors.
- [x] Local migration runtime check completed.
- Command executed: npm run db:migrate:local (wrangler d1 migrations apply DB --local).
- Result: migrations `0000` to `0004` applied; subsequent run shows `No migrations to apply!`.
- [x] Remote D1 migration pushed successfully.
- Command executed: npm run db:migrate:remote (wrangler d1 migrations apply DB --remote).
- Result: migrations `0000` to `0004` applied on database `4e83da95-b2db-49e3-8017-6c9c284afa8e`.
- [x] Remote table verification completed.
- Command executed: pnpm exec wrangler d1 execute DB --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;".
- Tables confirmed: `users`, `user_auth`, `signin_logs`, `orders`, `credit_records`, `credit_consumptions`, `subscriptions`, `ai_tasks`, `d1_migrations`.
- [x] Migration scripts aligned to binding name.
- `package.json` updated: `db:migrate:local` and `db:migrate:remote` now use `DB` binding instead of old `nanobanana2pro`.
- [ ] Follow-up when back home:
- [x] 实现 callback 幂等性修复并补充回归测试
- run one end-to-end payment simulation (checkout.completed + callback + credits refresh)

## 2026-03-23 Latest updates (credits rules + naming)

- [x] Free plan rule updated: free usage now requires sign-in.
- [x] New-account initial credits standardized to `INITLIZE_CREDITS = 5`.
- [x] Guest daily free quota removed (`DEFAULT_FREE_DAILY_TRANSLATIONS = 0`).
- [x] Signed-in daily free quota standardized to `5` (`DEFAULT_TRIAL_DAILY_TRANSLATIONS = 5`).
- [x] Translation paid billing standardized to fixed `1 credit` per successful request.
- [x] Task-level credits constant renamed from `NANO_BANANA_TASK_CREDITS` to `EVERY_TASK_CREDITS`.
- [x] All related references updated and `pnpm run typecheck` passed.

## 2026-03-23 Latest updates (online 504 timeout fix)

- [x] Issue reproduced and confirmed in production path: `POST /api/translate/linkedin` returned `504 Gateway Timeout`, while `app.pageview.app` error was analytics script noise and not the core blocker.
- [x] Upstream baseline checks completed against Gemini 2.5 Flash endpoint: realistic requests often took ~13s-19s, with occasional transient `fetch failed` / socket termination.
- [x] Server translation provider hardened in `app/.server/services/linkedin-translation-provider.ts`:
- added configurable timeout via `LINKEDIN_TRANSLATION_TIMEOUT_MS` (default 35s, bounded 10s-60s)
- added bounded retry via `LINKEDIN_TRANSLATION_MAX_ATTEMPTS` (default 2, bounded 1-4)
- added retry backoff via `LINKEDIN_TRANSLATION_RETRY_BASE_DELAY_MS` (default 400ms)
- added retryable network/provider error classification and graceful normalization
- kept structured output path, with safer fallback to plain-text completion on retryable failure
- [x] Frontend error handling improved in `app/features/linkedin-translator/translation-interface.tsx`:
- normalized `Failed to fetch` into user-friendly network message
- normalized timeout / 504 into explicit timeout message
- added status-based fallback message for 5xx responses
- [x] Verification passed after patch:
- `pnpm run typecheck`
- `npm run build`
- [ ] Ops follow-up: confirm production Cloudflare Worker env has a valid `KIEAI_APIKEY` configured in Dashboard vars/secrets for the currently routed service.
## 2026-03-24 GA 统计接入记录（Codex）

### 操作目标
- [x] 使用环境变量 GOOGLE_ANALYTICS_ID 在全站每个页面注入 GA（gtag.js）统计代码。
- [x] 让 SPA 路由切换也触发页面访问上报（page_path），避免只统计首屏。
- [x] 修复本地开发环境中“仅在 React Router loaderData 看到 GA ID，但页面元素中看不到 GA 脚本”的问题。

### 修改文件
- [x] app/features/document/index.tsx
- [x] types/global.d.ts

### 修改内容（详细）
- [x] 在全局文档组件C:\Users\1\Desktop\test\linkedin-translator\app\features\document\index.tsx 的 head 中直接渲染 GA 脚本。
- [x] 新增 script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}"。
- [x] 新增 GA 初始化脚本：window.dataLayer、gtag('js', new Date())、gtag('config', GOOGLE_ANALYTICS_ID)。
- [x] 删除旧的 useEffect + createElement 动态注入 GA 脚本实现，避免重复注入与清理复杂度。
- [x] 引入 useLocation() 并在路由变化时调用：window.gtag("config", GOOGLE_ANALYTICS_ID, { page_path: pathname + search })。
- [x] 通过 hasTrackedNavigationRef 跳过首个初始化重复上报，仅对后续路由切换上报。
- [x] 将 GA 的注入与路由上报条件从“仅生产环境”调整为“只要有 GOOGLE_ANALYTICS_ID 就启用”，便于本地联调验证。
- [x] 保留 Ads / Plausible 的生产环境控制逻辑，不影响既有广告与其他统计脚本策略。
- [x] 在 types/global.d.ts 增加 window.gtag 与 window.dataLayer 的全局类型声明。

### 结果与验证
- [x] 确认 GOOGLE_ANALYTICS_ID 会从 root loaderData 传入 Document（示例值：G-33HJFY9X9D）。
- [x] 明确记录：window.__reactRouterContext.streamController.enqueue(...) 属于 React Router 数据流，不是 GA 脚本本体。
- [x] 执行 pnpm run build，构建通过，确认本次改动未破坏打包链路。

## 2026-03-24 /base Workspace 页面改版记录（Codex）

### 操作目标
- [x] 重新规划并统一 `/base/profile`、`/base/credits`、`/base/orders`、`/base/subscription` 四个页面的前端展示结构。
- [x] 修复/规避品牌文案异常（如 logo 旁显示 `hair room`）问题，确保后台区域品牌显示一致。
- [x] 收敛页面信息层级与空态展示，降低“有按钮但无真实动作”的误导体验。

### 本轮完成项
- [x] `/base` 布局改为统一的 workspace 壳：左侧导航 + 右侧主工作区（响应式支持）。
- [x] 顶部导航从泛首页入口调整为后台导向（`Dashboard`、`Pricing`、`FAQs`、`Support`）。
- [x] 侧边栏升级为语义化导航（Profile/Credits/Orders/Subscription），补充图标与说明文案。
- [x] Profile 页移除无后端落地的“Save Changes”伪表单，改为账号信息面板与状态卡展示。
- [x] Credits 页余额计算改为服务端真实值（`getUserCredits`），并重构交易记录视图与空态。
- [x] Orders 页补充统计卡、状态映射、金额与时间格式化，去除 `any` 风险写法。
- [x] Subscription 页移除 `alert` 占位操作，改为真实可执行动作（升级或邮件支持），并展示订阅历史。
- [x] 新增 `workspace` 共享 UI 工具组件，统一页面头部、状态卡、空态、时间/金额格式化逻辑。
- [x] 在 header / drawer / footer 显式传入 `Logo` 的 `label` 与 `imageAlt`，固定品牌文案为 `LinkedIn Translator`。

### 关键文件与修改内容
- [x] `app/routes/base/layout/index.tsx`
- 调整 `header.navLinks`（Dashboard / Pricing / FAQs / Support）。
- 重构 `/base` 主体容器布局，统一后台页面视觉结构。

- [x] `app/routes/base/layout/components/sidebar.tsx`
- 将简单链接列表改为 workspace 侧栏：图标、描述、激活态、底部引导入口。

- [x] `app/routes/base/profile.tsx`
- 改为可读性优先的账号信息页，显示 `nickname/email/avatar/created_at`，移除无提交逻辑的输入表单。

- [x] `app/routes/base/credits.tsx`
- loader 新增 `getUserCredits(user)`，余额以服务端计算为准。
- 页面重构为统计卡 + 记录表，补充类型标签与空态。

- [x] `app/routes/base/orders.tsx`
- 增加订单统计与状态颜色映射，展示 `order_no/product/status/amount/paid_at`。
- 统一金额与时间格式化展示。

- [x] `app/routes/base/subscription.tsx`
- 由“仅 active 单条”扩展为“current + history”展示。
- 移除前端占位 `alert`，替换为可执行的升级/支持动作。

- [x] `app/routes/base/components/workspace.tsx`（新增）
- 新增共享组件：`PageIntro`、`StatTile`、`EmptyState`。
- 新增共享格式化工具：`formatDate`、`formatDateTime`、`formatCurrencyFromCents`、`formatInteger`。

- [x] `app/features/layout/base-layout/header.tsx`
- Logo 显式指定：`label="LinkedIn Translator"`、`imageAlt="LinkedIn Translator logo"`（含移动抽屉）。

- [x] `app/features/layout/base-layout/footer.tsx`
- Footer Logo 显式指定品牌文案，统一后台与全站品牌显示。

### 验证结果
- [x] `pnpm run typecheck` 通过。
- [x] `pnpm run build` 通过。

### 线上校验提示
- [ ] 若线上仍看到旧样式或异常文案，优先检查部署版本与 CDN/浏览器缓存（强刷后再验收）。

## 2026-03-24 /base 路由 SEO metadata 补充记录（Codex）

### 操作目标
- [x] 为 `/base` 账号页补齐 SEO metadata，解决 title / description / canonical 为空的问题。
- [x] 每个页面独立配置 metadata，避免多个页面共用或覆盖同一组文案。

### 本轮完成项
- [x] 为 `/base/profile` 新增 `meta`：`title`、`description`、`canonical`。
- [x] 为 `/base/credits` 新增 `meta`：`title`、`description`、`canonical`。
- [x] 为 `/base/orders` 新增 `meta`：`title`、`description`、`canonical`。
- [x] 为 `/base/subscription` 新增 `meta`：`title`、`description`、`canonical`。
- [x] 以上 4 个页面统一补充 `robots: noindex, nofollow`（账号后台页默认不收录）。

### 关键文件与修改内容
- [x] `app/routes/base/profile.tsx`
- 新增 `export const meta`，canonical 指向 `/base/profile`。

- [x] `app/routes/base/credits.tsx`
- 新增 `export const meta`，canonical 指向 `/base/credits`。

- [x] `app/routes/base/orders.tsx`
- 新增 `export const meta`，canonical 指向 `/base/orders`。

- [x] `app/routes/base/subscription.tsx`
- 新增 `export const meta`，canonical 指向 `/base/subscription`。

### 验证结果
- [x] `pnpm run typecheck` 通过。

## 2026-03-24 /base 布局回调记录（Codex）

### 操作目标
- [x] 删除顶部导航在移动端右侧抽屉中显示的菜单面板。
- [x] 将 `/base` 页面 Footer 调整为与首页一致的展示风格。
- [x] 将 `/base` 左侧导航恢复为原先样式，并保持“左侧点击、右侧内容区切换”。

### 本轮完成项
- [x] Header 中移除 `drawer`/`drawer-side` 整块结构，不再渲染右侧弹出菜单。
- [x] Footer 改为首页同款结构（浅底、品牌区 + Legal + Support 分组）。
- [x] Sidebar 从增强版卡片导航恢复为原先简洁侧栏样式（`Profile` / `Credits & History` / `Orders` / `Subscription`）。

### 关键文件与修改内容
- [x] `app/features/layout/base-layout/header.tsx`
- 删除右侧抽屉菜单相关 JSX 与状态逻辑，保留桌面导航与用户信息区。

- [x] `app/features/layout/base-layout/footer.tsx`
- 结构改为首页一致版式，并统一品牌文案与链接分组。

- [x] `app/routes/base/layout/components/sidebar.tsx`
- 恢复旧版左侧导航组件与激活态样式，维持左侧导航位置与右侧内容联动。

### 验证结果
- [x] `pnpm run typecheck` 通过。

## 2026-03-24 支付回调幂等性修复记录（Codex）

### 目标
- [x] 修复 Creem 支付成功后，callback/webhook 同时触发时误显示 Payment Failed 的问题。
- [x] 保持签名校验严格（`Invalid Signature` 仍然必须失败）。
- [x] 统一 callback/webhook 可忽略的支付状态错误，避免两处规则漂移。

### 实施内容
- [x] `app/.server/services/order.ts`
- `handleOrderComplete` 对已完成订单改为幂等返回：`order.status === "completed"` 时直接返回成功，不再抛错。

- [x] `app/routes/_callback/payment/route.tsx`
- 为 callback 增加重复完成兜底（`Transaction is completed` / `Transaction is processing`），避免误判失败页。

- [x] `app/routes/_webhooks/payment/route.ts`
- 复用共享的可忽略支付错误判定，移除路由内重复维护的错误列表。

- [x] `app/.server/services/order-errors.ts`（新增）
- 新增共享方法：`isDuplicateOrderCompletionError`、`isIgnorableWebhookPaymentError`。

### 测试与验证
- [x] 在 `tests/unit/index.test.ts` 新增回归测试，覆盖：
- 重复完成错误识别
- webhook 可忽略错误判定不包含 `Invalid Signature`

- [x] 已执行：`pnpm run test:unit`（14/14 通过）
- [x] 已执行：`pnpm run typecheck`（通过）
- [x] 已执行：`pnpm run build`（通过；首次沙箱内因 `spawn EPERM` 失败，提权后重跑通过）

### 后续待办
- [x] 线上执行一次支付回放核验：
- 完成一次真实 checkout
- 刷新/重复打开同一个 callback URL
- 确认页面持续显示成功，且 credits 数据一致

## 2026-03-25 Performance 优化记录（Codex）

### 目标
- [x] 基于 PageSpeed Insights（mobile）结果，优先修复首屏渲染与资源加载问题。
- [x] 在不影响主流程的前提下，降低首屏图片与第三方脚本开销。

### 本轮已完成
- [x] 新增小尺寸 Logo 资源：`public/assets/logo-64.png`（约 8.3KB），并替换页面中小尺寸 logo 引用。
- [x] 首屏 Hero 关键文案改为静态首屏渲染（移除首屏动画延迟），避免 LCP 文本晚出现。
- [x] Google OAuth 改为点击后再挂载（Lazy mount），避免首屏加载 `accounts.google.com/gsi/client`。
- [x] GA / Ads / Pageview 改为 `window.load` 后延迟注入，移除 head 里的同步 GA 注入。
- [x] 字体首屏策略减重：正文 `--font-sans` 改系统字体栈；`google-fonts.css` 仅保留 Manrope 400/700。

### 主要改动文件
- [x] `app/features/document/index.tsx`
- [x] `app/features/linkedin-translator/landing-page.tsx`
- [x] `app/components/common/logo.tsx`
- [x] `app/app.css`
- [x] `public/fonts/google-fonts.css`
- [x] `public/assets/logo-64.png`

### 验证结果
- [x] `pnpm run typecheck` 通过。
- [x] `pnpm run build` 通过。

### 预期收益（按 PSI 诊断）
- [x] 降低首屏 LCP/FCP 风险（首屏文本立即可见，减少 hydration 后延迟显示）。
- [x] 降低 unused JavaScript 风险（第三方统计与登录 SDK 不再首屏立即加载）。
- [x] 降低图片传输浪费（32x32 场景不再下载 155KB logo）。

### 后续建议
- [ ] 部署后重新跑一次 mobile PSI，对比 FCP/LCP/TTI 和 opportunities 是否下降。

## 2026-04-06 本地 /base 免登录配置记录（模板复用）

### 问题现象
- [x] 本地开发访问 `/base/*` 仍被要求登录，未按预期跳过 Base Auth。

### 根因结论
- [x] 本地实际读取的是 `.dev.vars`，不是 `.dev copy.vars`。
- [x] `BYPASS_BASE_AUTH_IN_DEV` 的语义是：`true` 才跳过登录；`false` 会要求登录。
- [x] 之前配置值写成了 `flase`（拼写错误），会被解析为非真值，等同于未开启 bypass。

### 正确配置（本地开发）
- [x] 在项目根目录 `.dev.vars` 中设置：`BYPASS_BASE_AUTH_IN_DEV="true"`。
- [x] 修改后重启本地 dev 进程（环境变量在启动时加载，热更新不会刷新该变量）。

### 代码定位（后续排查入口）
- [x] 开关解析逻辑：`app/.server/libs/base-auth.ts`
- [x] `.dev.vars` 加载逻辑：`vite.config.ts`

## 2026-04-07 Public Header / Footer 统一记录（Codex）

### 操作目标
- [x] 统一首页、内容页、法务页的 public header / footer，不再由多套组件分别拼装。
- [x] 在 public header 中补充 `Blog` 主导航，并在 `Sign In` 左侧加入语言切换入口。
- [x] 先移除内容页 header 下方的 `tools / templates / blog` 二级导航，后续如果 `/tools`、`/templates` 成熟，再并入主 header。

### 本轮完成项
- [x] 新增公共站点布局：`app/features/layout/base-layout/public-site-layout.tsx`。
- [x] 首页、内容页、法务页统一改为复用 `PublicSiteLayout`。
- [x] 公共 header 继续复用 `MarketingHeader`，语言切换通过共享组件 `MarketingHeaderLocaleSwitch` 注入到右侧区域。
- [x] 首页主导航文案补充 `Blog`；中文主导航同步补充 `博客`，分别指向 `/blog` 与 `/zh/blog`。
- [x] 内容页不再单独渲染第二排站内导航，只保留公共 header。
- [x] `/blog` 在内容站场景下仍可在主 header 中保持高亮，便于区分当前位于博客体系。
- [x] Footer 新增 `brandTo`，保证中文页 footer 品牌链接返回 `/zh`，英文页返回 `/`。

### 关键文件与修改内容
- [x] `app/features/layout/base-layout/public-site-layout.tsx`
- 统一 public 页面的主 header / footer、语言切换、`/blog` 主导航高亮逻辑。

- [x] `app/features/layout/base-layout/marketing-header.tsx`
- 新增 `MarketingHeaderLocaleSwitch` 共享语言切换组件，供 public 布局复用。

- [x] `app/features/layout/base-layout/footer.tsx`
- 新增 `brandTo` 参数，支持 footer 品牌链接按语言返回对应首页。

- [x] `app/features/linkedin-translator/i18n.ts`
- 首页导航增加 `Blog` / `博客`。

- [x] `app/features/linkedin-translator/landing-page.tsx`
- 首页改为直接复用 `PublicSiteLayout`，移除页面内手写的 header / footer 拼装。

- [x] `app/features/content/site-layout.tsx`
- 内容页改为复用 `PublicSiteLayout`，并删除原先的二级导航注入逻辑。

- [x] `app/components/pages/legal/index.tsx`
- 法务页改为复用 `PublicSiteLayout`，与首页、内容页保持同一套 public 站点 chrome。

### 当前产品决策
- [x] 当前 public header 只保留首页信息架构里的主导航：`About / How it Works / Why Us / FAQ / Blog`。
- [x] `tools / templates` 暂不放进主 header。
- [x] 内容页二级导航先整体移除，后续如果 `/tools`、`/templates` 真正上线并需要入口，再直接改 `app/features/linkedin-translator/i18n.ts` 的主导航配置。

### 验证结果
- [x] `.\node_modules\.bin\tsc.cmd -b --pretty false` 通过。

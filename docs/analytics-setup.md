# Analytics Setup

## Overview

当前项目使用的是：

- React Router v7
- Vite
- Cloudflare Workers runtime env

GA4 不走 `import.meta.env.VITE_*` 直读，而是沿用这条链路：

1. Cloudflare runtime env 提供 `GOOGLE_ANALYTICS_ID`
2. `workers/app.ts` 将 `env` 注入 React Router `AppLoadContext`
3. `app/root.tsx` 的 loader 读取 `GOOGLE_ANALYTICS_ID`
4. loader data 传给文档层
5. analytics 组件完成初始化和路由追踪

这条链路更适合当前模板，因为它与 Cloudflare 部署模型一致，也避免把配置直接耦合到前端构建环境变量命名。

## File Responsibilities

### `app/lib/analytics/gtag.ts`

基础 gtag 工具层。

职责：

- 生成 GA4 脚本 URL
- 生成 bootstrap 初始化脚本
- 封装 `pageview(...)`
- 封装 `trackEvent(...)`

业务层如需新增自定义事件，应优先调用这里，而不是在页面里直接写 `window.gtag(...)`。

### `app/components/analytics/GoogleAnalytics.tsx`

GA4 初始化组件。

职责：

- 根据 measurement ID 决定是否启用 GA
- 在 SSR `<head>` 输出：
  - `gtag/js`
  - `dataLayer` / `gtag("js")` / `gtag("config")`
- 没有 ID 时安全返回 `null`

### `app/components/analytics/RouteAnalytics.tsx`

SPA 路由追踪组件。

职责：

- 监听 React Router 路由变化
- 在客户端导航时显式发送 `page_view`
- 避免首屏和客户端初始化重复上报

### `app/features/document/index.tsx`

文档壳组件。

职责：

- 继续负责 HTML 框架、`Meta`、`Links`、`Scripts`
- 组合 `GoogleAnalytics` 和 `RouteAnalytics`
- 不再直接承载具体的 GA 细节实现

### `app/root.tsx`

配置下发入口。

职责：

- 从 Cloudflare runtime env 读取 `GOOGLE_ANALYTICS_ID`
- 通过 root loader data 传给文档层

### `wrangler.jsonc` / `wrangler.local.jsonc`

Cloudflare 配置入口。

职责：

- 为 Worker 提供 `GOOGLE_ANALYTICS_ID`
- 保证部署产物和本地 Cloudflare 预览都能拿到相同 key

## Current Data Flow

完整链路如下：

1. Cloudflare `vars.GOOGLE_ANALYTICS_ID`
2. Worker runtime `env.GOOGLE_ANALYTICS_ID`
3. `app/root.tsx` loader
4. `Document`
5. `GoogleAnalytics` 在 SSR head 完成基础初始化
6. `RouteAnalytics` 在客户端路由切换时发送 `page_view`
7. 所有后续业务事件统一从 `app/lib/analytics/gtag.ts` 发出

## Reusing This Structure In A New Project

如果把这个模板复制到新项目，通常只需要改这些地方：

1. 修改 `wrangler.jsonc`
   - 将 `GOOGLE_ANALYTICS_ID` 换成新项目的 measurement ID
2. 修改 `wrangler.local.jsonc`
   - 保持本地预览与线上一致
3. 保留 `app/lib/analytics/gtag.ts`
4. 保留 `app/components/analytics/GoogleAnalytics.tsx`
5. 保留 `app/components/analytics/RouteAnalytics.tsx`
6. 在新项目的根文档壳里继续组合这两个组件
7. 如果 root loader 字段名有变化，同步调整传参即可

如果你以后还想接别的埋点平台，建议沿用相同模式：

- 工具层放 `app/lib/analytics/*`
- 组件层放 `app/components/analytics/*`
- 文档层只负责组合，不写平台细节

## Configuring `GOOGLE_ANALYTICS_ID`

当前模板使用键名：

- `GOOGLE_ANALYTICS_ID`

推荐配置位置：

1. `wrangler.jsonc`
2. `wrangler.local.jsonc`

如果以后你希望把值改到 Cloudflare Dashboard，也请继续使用同一个 key。

注意：

- GA measurement ID 是公开标识，不是 secret
- 真正的关键是保证 Worker runtime 能拿到它

## How To Verify

### Verify `gtag/js`

浏览器 Network 过滤：

- `googletagmanager`

应看到：

- `https://www.googletagmanager.com/gtag/js?id=<your-id>`

### Verify collect requests

浏览器 Network 过滤：

- `collect`
- `g/collect`

应看到：

- 首屏访问至少一次 collect
- 站内路由切换后继续出现 collect

### Verify GA4 Realtime

1. 打开 GA4 Realtime
2. 打开站点
3. 停留数秒
4. 执行一次客户端路由切换
5. 观察当前活跃用户和 `page_view`

### Verify GA4 DebugView

调试目标：

- 首屏出现 `page_view`
- SPA 路由切换再次出现 `page_view`
- `page_path` 与当前 URL 一致

## Notes For Future Custom Events

如果以后要加按钮点击、转化、表单提交等事件：

1. 先在 `app/lib/analytics/gtag.ts` 添加或复用封装
2. 再在业务组件里调用封装
3. 不要在业务页面里散写 `window.gtag(...)`

这样模板迁移时，analytics 逻辑仍然集中、可维护、可验证。

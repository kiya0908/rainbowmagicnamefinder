# GA4 Troubleshooting Report

## Problem Symptoms

- GA4 Measurement ID: `G-WXB3YC322J`
- Google Analytics 后台提示 Google 代码已安装
- 浏览器里曾能观察到 `gtag/js` 资源
- 但 GA4 Realtime 一直没有数据
- 后台首页持续提示“尚未从您的网站收到任何数据”

## Audit Conclusions

当前项目的链路是：

1. `workers/app.ts` 把 Cloudflare runtime `env` 注入到 React Router `AppLoadContext`
2. `app/root.tsx` 的 root loader 从 `context.cloudflare.env.GOOGLE_ANALYTICS_ID` 读取 measurement ID
3. root loader data 再传给 `Document`
4. 旧版 `app/features/document/index.tsx` 在客户端 `useEffect` 中等待 `window.load`
5. 然后额外延迟 2500ms 才动态插入 `gtag/js`
6. 路由切换时再重复调用 `gtag("config", GOOGLE_ANALYTICS_ID, { page_path })`

线上抓取到的首页 HTML 证明：

- root loader data 中的 `GOOGLE_ANALYTICS_ID` 是空字符串
- 不是预期的 `G-WXB3YC322J`

这意味着当前生产 Worker 没有把 GA ID 真正传递给浏览器端。

## Root Cause Analysis

### Root Cause 1: Production runtime env did not provide `GOOGLE_ANALYTICS_ID`

这是本次问题的直接根因。

- loader 读的是 Cloudflare runtime env
- 线上返回给浏览器的 loader data 已经是空值
- 没有 measurement ID 时，GA 初始化逻辑会直接短路
- 结果就是没有真正的 `gtag("config", ...)` 初始化，也没有 `collect`

### Root Cause 2: GA initialization was delayed until `window.load + 2500ms`

即使 env 有值，旧实现也不稳妥：

- 初始化过晚
- 首屏短访问可能在脚本加载前就离开
- 不利于验证和复用

### Root Cause 3: SPA tracking logic was not explicit enough

旧版路由切换依赖重复 `gtag("config", ...)`：

- 语义不清晰
- 验证成本高
- 不利于后续模板复用

## Fix Summary

本次改造同时完成“修复 + 组件化整理”：

1. 在 `wrangler.jsonc` 和 `wrangler.local.jsonc` 中声明 `vars.GOOGLE_ANALYTICS_ID`
2. 保留 `Cloudflare env -> loader -> 客户端` 主链路
3. 新增 `app/lib/analytics/gtag.ts`
   - 统一封装 gtag 脚本 URL
   - 统一封装初始化脚本
   - 统一封装 `pageview` / `trackEvent`
4. 新增 `app/components/analytics/GoogleAnalytics.tsx`
   - 在 SSR `<head>` 输出标准 GA4 初始化脚本
   - 没有 ID 时安全降级
5. 新增 `app/components/analytics/RouteAnalytics.tsx`
   - 跟踪 React Router 路由变化
   - 显式发送 `page_view`
   - 避免首屏重复发送
6. `app/features/document/index.tsx`
   - 删除旧的 `window.load + 2500ms` 注入逻辑
   - 删除旧的重复 `config` 路由埋点方式
   - 改为组合 analytics 组件

## Verification Steps

### Browser Network

打开浏览器开发者工具，过滤以下请求：

- `googletagmanager`
- `g/collect`
- `collect?v=2`

应能看到：

1. `https://www.googletagmanager.com/gtag/js?id=G-WXB3YC322J`
2. 首屏访问时的 GA4 collect 请求
3. 客户端路由切换后的后续 collect 请求

### GA4 Realtime

1. 打开网站
2. 停留数秒
3. 在 GA4 Realtime 中查看当前活跃用户
4. 在站内执行一次路由切换，再观察事件变化

### GA4 DebugView

可在浏览器安装 Google Analytics Debugger，或在调试时用自定义事件辅助观察。

验证目标：

- 首屏出现 `page_view`
- 路由切换后再次出现 `page_view`
- 事件的 `page_location` / `page_path` 与当前页面一致

## Final Conclusion

之前“代码存在但没有数据”的本质原因不是 React Router、Vite 或 Cloudflare Workers 架构本身不兼容，而是：

1. 生产 runtime env 没有把 `GOOGLE_ANALYTICS_ID` 提供给 Worker
2. 旧版前端初始化方式又过晚、过脆弱

修复后，GA4 已经变成一套独立的组件和工具层结构，既能解决当前项目不上报的问题，也更适合后续模板复用。

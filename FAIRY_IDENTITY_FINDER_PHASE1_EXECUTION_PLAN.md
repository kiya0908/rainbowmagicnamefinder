# Fairy Identity Finder — Phase 1 MVP 执行计划

> 本文档是为 Codex 编写的实施指南，用于在现有 Cloudflare 部署模板上增量修改，构建 Phase 1 MVP。
> 生成日期：2026-04-09

---

## 1. 项目目标

### 1.1 业务目标

构建一个基于名字输入的轻互动产品（Rainbow Magic Fairy Name Finder），通过确定性匹配为用户分配一个 Fairy 角色，生成可分享的身份卡片，驱动社交传播（UGC）和 SEO 自然流量。

**核心价值主张**：*"Find your fairy name and see if it looks like you."*

### 1.2 技术目标

- 在现有 React Router + Cloudflare Workers 模板上**增量修改**，复用已有的构建、部署、布局和样式体系
- 实现纯前端确定性匹配逻辑（无后端 API 依赖）
- 生成一个视觉吸引力强、适合截图分享的结果卡片
- 保留 Cloudflare 完整部署兼容性

### 1.3 成功标准

| 指标 | 目标 |
|------|------|
| 输入 → 生成转化率 | 用户能在 3 秒内完成输入并看到结果 |
| 分享率 | 结果卡片视觉足够吸引用户主动截图/分享 |
| SEO 可索引性 | 首页 H1 / meta / 结构化内容覆盖核心关键词 |
| 构建部署 | `pnpm run build && wrangler deploy` 零错误 |

---

## 2. 实施上下文

### 2.1 这不是从零开始的项目

当前代码库是一个已经部署在 Cloudflare Workers 上的 **React Router v7 + Vite + TailwindCSS v4 + DaisyUI** 全栈应用模板（原项目为 LinkedIn Translator）。所有修改必须在此基础上进行增量变更。

### 2.2 现有模板的关键技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React Router v7（SSR 模式） |
| 构建 | Vite + `@cloudflare/vite-plugin` |
| 样式 | TailwindCSS v4 + DaisyUI v5 + 自定义 CSS 主题变量 |
| 动画 | Motion (Framer Motion) |
| 图标 | Lucide React |
| 状态管理 | Zustand |
| 部署 | Cloudflare Workers + D1 + KV |
| 字体 | Manrope (display) + Libre Baskerville + 系统 sans-serif |

### 2.3 必须保留的内容

- `vite.config.ts` — Cloudflare 插件配置、TailwindCSS 集成、tsconfig paths
- `react-router.config.ts` — SSR + `unstable_viteEnvironmentApi` 配置
- `workers/app.ts` — Worker fetch handler
- `wrangler.jsonc` — 部署配置（名称、绑定可后续修改）
- `app/root.tsx` — Document/Layout 模式（但 App 组件中的 auth bootstrap 可精简）
- `app/features/document/index.tsx` — HTML 文档壳（GA / AdSense / Plausible 注入逻辑）
- `app/features/layout/base-layout/` — PublicSiteLayout / MarketingHeader / Footer 组件框架
- `app/app.css` — 主题设计系统（颜色变量、字体、基础样式）
- `app/utils/meta.ts` — createCanonical / createAlternate 工具函数
- `tsconfig.*.json` — TypeScript 配置体系
- `package.json` 中的核心依赖（react, react-router, tailwindcss, motion, lucide-react, clsx, zustand）

### 2.4 可以安全移除/替换的内容

- `app/features/linkedin-translator/` — 整个功能模块（landing-page, translation-interface, i18n, pricing, config, access）
- `app/routes/home.tsx` 和 `app/routes/zh.tsx` — 路由指向（需改为 fairy finder）
- `app/features/oauth/` — Phase 1 不需要登录
- `app/routes/base/` — 后台页面（profile, credits, orders, subscription）
- `app/routes/_api/` — API 路由（auth, create-order 等）
- `app/routes/_webhooks/` — Webhook 路由
- `app/routes/_callback/` — 回调路由
- `app/.server/` 中与 LinkedIn Translator 相关的服务端逻辑
- `app/store/user.ts` — 用户认证状态（Phase 1 可保留但不使用）
- `app/constants/pricing.ts` — 定价配置

> ⚠️ **关键原则**：优先注释/忽略旧代码，而非大面积删除。确保构建始终通过。

---

## 3. 输入材料摘要

### 3.1 PRD 摘要

PRD 定义了一个双阶段产品：

- **Phase 1（MVP）**：名字输入 → 确定性 Fairy 匹配 → 结果卡片 → 分享 + 再生成
- **Phase 2（增长）**：AI 生成自定义 Fairy（本次不实现）

核心用户：12-30 岁社交媒体用户（TikTok / IG / 小红书），核心动机是身份认同 + 社交分享。

**结果卡片是产品的核心**，必须视觉精美、适合截图分享。

### 3.2 Fairy JSON 数据摘要

`doc/books_data.json` 包含 **326 条** Fairy 记录，每条结构为：

```json
{
  "index": 1,
  "title": "Abigail the Breeze Fairy",
  "image_url": "https://orchardseriesbooks.co.uk/wp-content/uploads/2018/11/9781843626343-197x300.jpg",
  "raw_image_url": "https://orchardseriesbooks.co.uk/wp-content/uploads/2018/11/9781843626343-197x300.jpg"
}
```

**关键观察**：
- `title` 格式为 `"[Name] the [Title] Fairy"` — 需要解析出 fairy name 和 fairy title
- 图片为外部 URL（orchardseriesbooks.co.uk），尺寸约 197×300px
- 存在少量重复 title（如 index 67/68 都是 "Elizabeth the Jubilee Fairy"），需要去重处理
- 无 `tags` / `description` 字段 — 与 PRD 中的理想数据结构有差异，Phase 1 可以省略 tags

### 3.3 Codex 实施前应检查的内容

在编写任何代码之前，Codex 应当：

1. 运行 `pnpm install` 确认依赖安装正常
2. 运行 `pnpm run build` 确认当前模板可以构建通过
3. 检查 `app/routes.ts` 了解完整路由结构
4. 检查 `app/features/layout/base-layout/public-site-layout.tsx` 了解页面壳层结构
5. 检查 `app/app.css` 了解主题变量系统
6. 检查 `app/features/document/index.tsx` 了解 HTML 文档结构
7. 检查 `app/features/linkedin-translator/landing-page.tsx` 了解现有着陆页的 section 模式（作为参照模板）

---

## 4. Phase 1 功能边界

### 4.1 范围内（IN SCOPE）

| 功能 | 描述 |
|------|------|
| 着陆页 Hero | 标题 + 副标题 + 名字输入框 + CTA 按钮 |
| 确定性 Fairy 匹配 | `hash(normalizedName) % fairyList.length → fairy` |
| 结果卡片 | Fairy 图片 + 名字 + 情绪文案 + 分享提示 |
| 分享功能 | Web Share API + Copy Image（降级为 Copy Link） |
| 再生成 | 清空输入 + 滚动回顶部 |
| "How It Works" 说明 | 3 步简要说明 |
| SEO 基础 | title / meta description / H1 / 结构化内容 |
| FAQ 区块 | 3-5 个常见问题 |
| 移动端适配 | 全页面响应式布局 |

### 4.2 范围外（OUT OF SCOPE）

| 功能 | 原因 |
|------|------|
| ❌ AI 生成 Fairy | Phase 2 |
| ❌ "Create your own fairy" 入口 | Phase 2，Phase 1 仅留占位文案 |
| ❌ 上传头像对比 | Phase 2 |
| ❌ 用户登录/注册 | Phase 1 不需要 |
| ❌ 数据库/KV 读写 | Phase 1 纯前端 |
| ❌ 支付/订阅 | Phase 1 不需要 |
| ❌ Admin 后台 | 不需要 |
| ❌ Programmatic SEO 页面 | Phase 1 之后的 SEO 扩展 |
| ❌ 多语言 | Phase 1 仅英文 |
| ❌ 中文路由 `/zh` | Phase 1 可移除或重定向到首页 |

> 🚫 **严禁**：不要实现 Phase 2 的 "Create your own fairy identity" 功能。仅允许在结果卡片下方放置一行灰色占位文案，如 *"Want to create your own fairy? Coming soon!"*

---

## 5. 工程原则

1. **最小安全变更**：每次修改尽可能小，确保构建始终通过
2. **复用现有结构**：沿用 PublicSiteLayout（Header/Main/Footer）、section 排列、motion 动画模式、TailwindCSS 主题变量
3. **Mobile-first**：UI 先设计移动端，再用 `md:` / `lg:` 断点扩展
4. **结果卡片是核心产品**：投入最多设计精力在 ResultCard 上——它必须好看到用户想截图分享
5. **无不必要依赖**：不新增 npm 包，除非有极强理由（现有依赖已覆盖所有需求）
6. **SEO + Cloudflare 兼容**：SSR 模式保留，meta 函数正确配置，`pnpm run deploy` 可用
7. **可扩展但不提前实现**：代码结构为 Phase 2 预留空间，但不写 Phase 2 的逻辑

---

## 6. 推荐实施顺序

### Step 0：检查现有代码库并确认构建状态

**目标**：确认当前模板可构建部署，理解可复用的结构

**涉及文件**：
- `package.json`
- `vite.config.ts`
- `wrangler.jsonc`
- `app/routes.ts`
- `app/root.tsx`

**复用**：所有构建配置
**新增**：无
**风险**：如果当前构建失败，需要先修复
**完成标准**：`pnpm run build` 成功，无错误

---

### Step 1：创建 Fairy 数据模块

**目标**：将 `books_data.json` 转化为项目可用的 TypeScript 数据模块，包含类型定义和去重后的数据

**涉及文件**：
- `app/features/fairy-finder/data/fairies.ts` [新增]
- `app/features/fairy-finder/data/types.ts` [新增]

**复用**：无
**新增**：
- `FairyData` 类型定义（`id`, `name`, `title`, `fullTitle`, `imageUrl`）
- 从 `books_data.json` 转化后的去重静态数组
- 导出 `FAIRY_LIST` 常量和 `FAIRY_COUNT` 常量

**数据转换逻辑**：
```
"Abigail the Breeze Fairy" → { name: "Abigail", title: "the Breeze Fairy", fullTitle: "Abigail the Breeze Fairy" }
```

**风险**：
- JSON 中有重复条目（如 index 67/68），需要按 title 去重
- 图片为外部 URL，可能存在跨域或可用性问题

**完成标准**：
- TypeScript 模块可正常导入
- 数据条数约 325 条（去重后）
- 构建通过

---

### Step 2：实现确定性匹配逻辑

**目标**：实现 `name → fairy` 的确定性映射函数

**涉及文件**：
- `app/features/fairy-finder/utils/match.ts` [新增]

**复用**：无
**新增**：
- `normalizeName(input: string): string` — 转小写、trim、去除非字母字符
- `hashName(name: string): number` — 简单确定性哈希（如 djb2 或逐字符 charCode 累加）
- `matchFairy(name: string): FairyData` — 组合上述函数：`FAIRY_LIST[hash(normalize(name)) % FAIRY_COUNT]`

**风险**：
- 哈希函数必须确定性（相同输入 → 相同输出）
- 空输入需要处理

**完成标准**：
- 对于任意非空字符串输入，返回一个有效的 `FairyData`
- 相同输入始终返回同一个结果
- 构建通过

---

### Step 3：精简路由和根组件

**目标**：清理不需要的路由，简化首页为 Fairy Finder 着陆页

**涉及文件**：
- `app/routes.ts` [修改]
- `app/routes/home.tsx` [修改]
- `app/root.tsx` [修改]

**复用**：
- 路由系统结构
- root loader 中的 DOMAIN / GA / ADS 环境变量传递
- Layout 组件中的 Document 包装

**新增/修改**：
- `routes.ts`：注释掉或移除 base layout / api / webhooks / callback 路由，保留 index / legal / meta 路由
- `home.tsx`：改为渲染 FairyFinderLandingPage 而非 LinkedinTranslatorLandingPage
- `root.tsx`：App 组件中的 auth bootstrap `useEffect` 可以注释掉（Phase 1 无需登录）

**风险**：
- 删除路由可能导致现有引用报错 — 用注释代替删除
- root.tsx 中的 App 组件修改需要保持 Outlet 正常渲染

**完成标准**：
- `pnpm run build` 通过
- `/` 路径正确渲染新的着陆页
- 没有 404 或构建错误

---

### Step 4：创建 Fairy Finder 着陆页 — Hero + 输入区

**目标**：实现着陆页的 Hero 区和名字输入区

**涉及文件**：
- `app/features/fairy-finder/landing-page.tsx` [新增]
- `app/features/fairy-finder/components/input-section.tsx` [新增]
- `app/features/fairy-finder/i18n.ts` [新增] — 页面文案集中管理

**复用**：
- `PublicSiteLayout` 组件（Header + Footer 壳层）
- TailwindCSS 主题变量（`bg-surface`, `text-on-surface`, `text-primary` 等）
- Motion 动画模式（`initial={{ opacity: 0, y: 20 }}`, `whileInView`）
- Section 排列模式（参照 linkedin-translator/landing-page.tsx 的 section 结构）

**新增**：
- Hero section：
  - Eyebrow badge: "✨ Rainbow Magic"
  - H1: "Find Your Rainbow Magic Fairy Twin"
  - Subtitle: "Enter your name, discover your fairy identity, and share with friends!"
  - 名字输入框（`<input type="text">` + Submit 按钮）
- InputSection 组件：
  - 受控输入（`useState`）
  - 提交处理（调用 `matchFairy` → 设置结果状态）
  - 基础验证（非空）

**UI 参考**：
- 现有 landing-page.tsx 的 hero section（line 131-145）的样式和间距
- 输入框使用 TailwindCSS 样式，不依赖 DaisyUI 的 input 组件

**风险**：
- Header / Footer 中仍有 LinkedIn Translator 的硬编码文案 — 需要修改 i18n 或直接修改 PublicSiteLayout 的 props
- MarketingHeader 中有 Google OAuth 按钮 — Phase 1 应隐藏或替换

**完成标准**：
- 首页显示 Hero + 输入框
- 输入名字后点击按钮可触发匹配（此时仅 console.log 结果即可）
- 移动端和桌面端布局正确

---

### Step 5：实现结果卡片（ResultCard）

**目标**：实现产品的核心组件——视觉精美的 Fairy 结果卡片

**涉及文件**：
- `app/features/fairy-finder/components/result-card.tsx` [新增]
- `app/features/fairy-finder/components/fairy-image.tsx` [新增]

**复用**：
- Motion 动画（入场动画）
- TailwindCSS 主题变量

**新增**：

ResultCard 结构（从上到下）：
```
┌─────────────────────────────┐
│      ✨ Fairy Image ✨       │
│     (带装饰边框/光晕)        │
│                             │
│   "This is literally you"   │
│                             │
│   Abigail the Breeze Fairy  │
│                             │
│  "Does she look like you?"  │
│                             │
│  [Share] [Try Another One]  │
└─────────────────────────────┘
```

**关键设计要求**：
- 卡片背景使用渐变或半透明玻璃效果
- Fairy 图片居中显示，有圆角和阴影装饰
- 情绪文案随机从预设列表中选择（如 "This is literally you", "Why does this match you so well?", "Is this your fairy twin?"）
- 入场动画（从下方 fadeIn + scale）
- 卡片整体需要有足够的视觉完整性，截图后单独看也好看

**CSS 相关**：
- 可能需要在 `app.css` 中添加 fairy 主题相关的颜色变量
- 考虑使用渐变色（如粉紫色系）配合现有的蓝色主色调

**风险**：
- 外部图片加载失败 — 需要 fallback 处理（onerror 替换为默认图片或 emoji）
- 图片尺寸不一致（197×300 vs 196×300 vs 其他）— 用 `object-cover` + 固定容器解决

**完成标准**：
- 输入名字后，结果区平滑展示结果卡片
- 卡片视觉精美，适合截图
- 移动端布局正确
- 图片加载有 loading 和 error 状态处理

---

### Step 6：实现分享功能

**目标**：实现结果卡片的分享能力

**涉及文件**：
- `app/features/fairy-finder/components/share-actions.tsx` [新增]

**复用**：无（新功能）

**新增**：
- **Web Share API**（主要方式）：
  ```ts
  navigator.share({
    title: "I'm Abigail the Breeze Fairy!",
    text: "Find your Rainbow Magic fairy twin!",
    url: window.location.href
  })
  ```
- **Copy Link 降级**：当 Web Share API 不可用时，显示 "Copy Link" 按钮
- **分享按钮 UI**：使用 lucide-react 的 `Share2` / `Copy` / `Link` 图标

**风险**：
- Web Share API 仅在 HTTPS + 支持的浏览器中可用 — 需要 `navigator.share` 检测
- Copy to clipboard 需要 `navigator.clipboard.writeText`

**完成标准**：
- 移动端点击分享按钮触发系统分享面板
- 桌面端显示 Copy Link 按钮并能复制成功
- 复制成功后有视觉反馈（如 "Copied!" 文案临时显示）

---

### Step 7：实现"再生成"功能

**目标**：允许用户重新输入名字获取新结果

**涉及文件**：
- `app/features/fairy-finder/components/generate-again-button.tsx` [新增]
- `app/features/fairy-finder/landing-page.tsx` [修改]

**复用**：无

**新增**：
- "Try Another Name" 按钮
- 点击后：清空结果状态 → 清空输入框 → 滚动到输入区 → 自动 focus 输入框
- 按钮使用次要样式（outline 或 ghost），不抢结果卡片的视觉焦点

**风险**：
- 滚动行为需要 smooth scroll
- 需要用 ref 控制输入框 focus

**完成标准**：
- 点击按钮后页面平滑滚动到输入区
- 输入框已清空并获得焦点
- 之前的结果已清除

---

### Step 8：完善着陆页其余内容区块

**目标**：补充 "How It Works" / "What Is" / FAQ / CTA 等内容区块

**涉及文件**：
- `app/features/fairy-finder/landing-page.tsx` [修改]
- `app/features/fairy-finder/i18n.ts` [修改]

**复用**：
- 现有 landing-page.tsx 中的 section 模式（eyebrow + h2 + description + cards/items）
- FAQ 手风琴组件模式（AnimatePresence + height 动画）
- "about" section 的卡片网格布局（用于 "What Is" 区块的亮点卡片）

**新增**：
- **"How It Works" section**（3 步说明）：
  1. Enter Your Name
  2. Discover Your Fairy Name
  3. Share With Friends
- **"What Is Rainbow Magic Fairy Name Finder" section**（SEO + 用户教育）：
  - H2 标题："What Is Rainbow Magic Fairy Name Finder?"
  - 2-3 段介绍文案（产品定义、Rainbow Magic 系列背景、为什么有趣）
  - 可选：3 列亮点卡片（"300+ Unique Fairies" / "Instant Match" / "Share & Compare"）
  - 参照现有 landing-page.tsx 的 about section 模式实现
- **FAQ section**（3-5 个问答）：
  - What is Rainbow Magic Fairy Name Finder?
  - How does the fairy matching work?
  - Can I get a different fairy?
  - Is this free to use?
- **Bottom CTA section**：鼓励分享 + "Find Your Fairy Now" 按钮（滚动到顶部）
- **Future CTA 占位**：一行灰色文案 "Want to create your own fairy? Coming soon!"

**风险**：无特别风险

**完成标准**：
- 着陆页从上到下结构完整：Hero → Result → How It Works → What Is → FAQ → CTA
- "What Is" 区块含 H2 标题和至少 2 段可爬取的长文内容
- 所有文案可通过 i18n 模块集中管理
- 响应式布局正确

---

### Step 9：更新 Header / Footer / 品牌信息

**目标**：将布局组件中的 LinkedIn Translator 品牌替换为 Fairy Name Finder

**涉及文件**：
- `app/features/fairy-finder/i18n.ts` [修改]
- `app/features/layout/base-layout/public-site-layout.tsx` [修改] 或新建 `fairy-site-layout.tsx`
- `app/features/layout/base-layout/footer.tsx` [修改]
- `app/features/layout/base-layout/marketing-header.tsx` [修改]

**复用**：
- 布局组件的整体结构（Header + Main + Footer）
- 导航链接模式

**新增/修改**：
- Logo 文字改为 "Fairy Name Finder"
- Header 导航链接更新（移除不需要的链接，如 pricing / tools）
- Footer 品牌名、描述、链接更新
- 移除 Google OAuth 按钮（Header 中）
- 移除 credits 显示

**风险**：
- MarketingHeader 与 PublicSiteLayout 强耦合于 linkedin-translator i18n — 需要解耦或创建新的 layout wrapper

**推荐方案**：创建 `app/features/fairy-finder/fairy-site-layout.tsx`，直接组合 MarketingHeader + Footer 并传入新的 props，而非修改原布局组件的默认值。这样可以最小化对现有文件的改动。

**完成标准**：
- 页面显示正确的品牌名
- Header 没有登录按钮
- Footer 链接和品牌信息正确

---

### Step 10：基础 SEO 配置

**目标**：配置首页的 meta 信息，确保搜索引擎可索引

**涉及文件**：
- `app/routes/home.tsx` [修改]
- `app/routes/_meta/[sitemap.xml].tsx` [修改]
- `app/utils/meta.ts` [保留/复用]
- `wrangler.jsonc` [修改 — 更新域名]

**复用**：
- `createCanonical` / `createAlternate` 工具函数
- 现有的 sitemap.xml 路由结构

**新增/修改**：
- `home.tsx` 的 `meta` 函数：
  ```
  title: "Rainbow Magic Fairy Name Finder — Find Your Fairy Twin"
  description: "Enter your name and discover your Rainbow Magic fairy twin! Find your fairy identity, see your fairy match, and share with friends."
  ```
- Canonical URL 指向新域名
- Sitemap 更新为新的页面列表
- `wrangler.jsonc` 中的 `name` 和 `routes` 更新

**风险**：
- 域名变更需要确认新域名已在 Cloudflare 配置

**完成标准**：
- 页面 `<title>` 和 `<meta name="description">` 正确
- `<h1>` 包含核心关键词
- Canonical URL 正确
- Sitemap 可访问

---

### Step 11：主题色调整（可选但推荐）

**目标**：将主色调从蓝色系（LinkedIn Translator）调整为更符合 Fairy 主题的色调

**涉及文件**：
- `app/app.css` [修改]

**复用**：主题变量系统

**新增/修改**：
- `--color-primary` 改为粉紫/魔法色系（如 `#9b59b6` 或 `#8b5cf6`）
- `--color-primary-container` 对应调整
- `--color-secondary-fixed` 调整为浅色配套
- 其他 surface 颜色可保留

**风险**：全局色彩变更影响所有组件 — 但这正是主题系统的优势

**完成标准**：
- 页面整体色调符合 Fairy / Magic 风格
- 所有组件颜色一致
- 无色彩对比度问题

---

### Step 12：最终 QA / PRD 对齐检查

**目标**：逐条核对 PRD 功能列表，验证 MVP 完整性

**检查清单**：
- [ ] 输入名字 → 显示 Fairy 结果
- [ ] 结果卡片包含：Fairy Image / Fairy Name / 情绪文案 / 分享按钮 / 再生成按钮
- [ ] 分享功能工作正常（移动端 + 桌面端）
- [ ] "Try Another Name" 功能正常
- [ ] "What Is" 区块含 H2 标题 + 介绍文案 + 亮点卡片，内容正确渲染
- [ ] 页面响应式布局（移动端 / 平板 / 桌面端）
- [ ] SEO meta 信息正确
- [ ] `pnpm run build` 构建成功
- [ ] 没有控制台错误
- [ ] 图片加载有 fallback 处理
- [ ] FAQ 手风琴正常展开/收起

---

## 7. 数据集成方案

### 7.1 数据存放位置

```
app/features/fairy-finder/data/
├── types.ts          # FairyData 类型定义
└── fairies.ts        # 静态 fairy 数据数组 + 导出
```

将 `books_data.json` 转化为 TypeScript 模块而非直接 import JSON，原因：
- 可以在编译时做去重和数据清洗
- 类型安全
- 可以预计算 fairy name / title 的拆分

### 7.2 数据结构

```typescript
export interface FairyData {
  id: number;           // 原始 index
  name: string;         // 从 title 解析出的名字，如 "Abigail"
  title: string;        // 头衔部分，如 "the Breeze Fairy"
  fullTitle: string;    // 完整标题，如 "Abigail the Breeze Fairy"
  imageUrl: string;     // 图片 URL
}
```

### 7.3 数据转换规则

1. 从 `title` 字段中提取 `name`：取第一个空格前的部分
2. 从 `title` 字段中提取 `title`：取第一个空格后的部分
3. 去重：按 `fullTitle` 去重，保留第一个出现的条目
4. `image_url` 映射为 `imageUrl`

### 7.4 匹配逻辑

```typescript
// 1. 规范化输入
function normalizeName(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, '');
}

// 2. 确定性哈希（djb2 算法）
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash >>> 0; // 确保无符号
  }
  return hash;
}

// 3. 匹配
function matchFairy(name: string): FairyData {
  const normalized = normalizeName(name);
  if (!normalized) return FAIRY_LIST[0]; // fallback
  const index = hashString(normalized) % FAIRY_LIST.length;
  return FAIRY_LIST[index];
}
```

### 7.5 为什么确定性映射优于随机匹配

- **可复现**：用户多次输入同一名字得到同一结果，增强"这就是我的 fairy"的认同感
- **可分享**：朋友输入同一名字可以验证结果
- **无后端**：纯前端计算，零延迟
- **可测试**：输入-输出关系确定，易于验证

---

## 8. UI / 组件映射方案

### 8.1 InputSection

| 属性 | 说明 |
|------|------|
| **用途** | 名字输入 + 提交按钮 |
| **最小行为** | 受控输入、非空验证、提交回调 |
| **可延迟** | 输入建议、名字自动补全 |
| **文件** | `app/features/fairy-finder/components/input-section.tsx` |

### 8.2 ResultCard

| 属性 | 说明 |
|------|------|
| **用途** | 展示匹配到的 Fairy 结果 |
| **最小行为** | 显示 Fairy 图片、名字、情绪文案；入场动画 |
| **可延迟** | 卡片下载为图片、Canvas 合成 |
| **文件** | `app/features/fairy-finder/components/result-card.tsx` |

### 8.3 FairyImage

| 属性 | 说明 |
|------|------|
| **用途** | Fairy 图片展示，带加载状态和 error fallback |
| **最小行为** | `<img>` + loading skeleton + onerror fallback |
| **可延迟** | 图片预加载、懒加载优化 |
| **文件** | `app/features/fairy-finder/components/fairy-image.tsx` |

### 8.4 ShareActions

| 属性 | 说明 |
|------|------|
| **用途** | 分享按钮组 |
| **最小行为** | Web Share API 按钮 + Copy Link 降级 |
| **可延迟** | Twitter/Facebook 直接分享链接、下载结果图 |
| **文件** | `app/features/fairy-finder/components/share-actions.tsx` |

### 8.5 GenerateAgainButton

| 属性 | 说明 |
|------|------|
| **用途** | 重新输入名字 |
| **最小行为** | 清空状态 + 滚动到输入区 + focus 输入框 |
| **可延迟** | 无 |
| **文件** | `app/features/fairy-finder/components/generate-again-button.tsx` |

### 8.6 SecondaryCTA（Phase 2 占位）

| 属性 | 说明 |
|------|------|
| **用途** | Phase 2 "Create your own fairy" 入口的占位 |
| **最小行为** | 一行灰色文案 "Want to create your own fairy? Coming soon!" |
| **可延迟** | 整个功能都是 Phase 2 |
| **文件** | 内联在 landing-page.tsx 即可，不需要独立组件 |

---

## 9. 着陆页内容结构

```
┌──────────────────────────────────────┐
│ Header (Logo + Nav)                  │  ← MarketingHeader（精简版）
├──────────────────────────────────────┤
│ HERO SECTION                         │  ← ✅ MVP 核心
│ - Eyebrow: "✨ Rainbow Magic"        │
│ - H1: "Find Your Rainbow Magic      │
│        Fairy Name"                   │
│ - Subtitle                           │
│ - [Input Name] [Find My Fairy →]     │
├──────────────────────────────────────┤
│ RESULT SECTION (初始隐藏)             │  ← ✅ MVP 核心
│ - ResultCard                         │
│ - ShareActions                       │
│ - GenerateAgainButton                │
│ - SecondaryCTA placeholder           │
├──────────────────────────────────────┤
│ HOW IT WORKS                         │  ← ✅ 轻量实现
│ - Step 1: Enter Your Name            │
│ - Step 2: Discover Your Fairy Name   │
│ - Step 3: Share With Friends         │
├──────────────────────────────────────┤
│ WHAT IS RAINBOW MAGIC                │  ← ✅ SEO + 用户教育
│ FAIRY NAME FINDER                    │
│ - H2: "What Is Rainbow Magic Fairy   │
│        Name Finder?"                 │
│ - 1-2 段介绍文案，解释：             │
│   · 什么是 Rainbow Magic 系列        │
│   · 本工具做什么（名字 → fairy 匹配）│
│   · 为什么有趣（身份认同 + 社交分享）│
│ - 可选：2-3 个亮点卡片               │
│   · "300+ Fairies" / "Instant Match" │
│   · "Free & Fun" / "Share with       │
│     Friends"                         │
├──────────────────────────────────────┤
│ SOCIAL PROOF / ENCOURAGEMENT         │  ← ⚡ 可选，轻量文案即可
│ - "Thousands have found their fairy" │
│ - 或精美的统计数字                    │
├──────────────────────────────────────┤
│ FAQ                                  │  ← ✅ SEO 需要
│ - 3-5 个常见问题                      │
├──────────────────────────────────────┤
│ BOTTOM CTA                           │  ← ✅ 轻量
│ - "Ready to find your fairy name?"   │
│ - [Find My Fairy →]                  │
├──────────────────────────────────────┤
│ Footer                               │  ← 复用现有 Footer
└──────────────────────────────────────┘
```

### "What Is" 区块设计详情

**目的**：
1. **SEO 价值** — 提供搜索引擎可抓取的长文内容，自然覆盖核心关键词（"rainbow magic fairy name finder" / "fairy name quiz"）
2. **用户教育** — 向不了解 Rainbow Magic 系列的新用户解释上下文
3. **信任建立** — 展示工具的数据规模和趣味性

**内容结构**：
```
H2: "What Is Rainbow Magic Fairy Name Finder?"

段落 1（产品定义）：
Rainbow Magic Fairy Name Finder is a free, fun tool that matches your
name to one of over 300 magical fairies from the beloved Rainbow Magic
book series. Simply enter your name, and our fairy matching algorithm
will reveal your fairy twin — complete with her unique title and
enchanting image.

段落 2（系列背景）：
The Rainbow Magic series, created by Daisy Meadows, features hundreds
of unique fairies — each with her own special power, from weather and
nature to music, sports, and celebrations. Our fairy name finder draws
from this magical world to create a personal connection between you and
your fairy identity.

段落 3（为什么有趣）：
Whether you're a longtime Rainbow Magic fan or discovering fairies for
the first time, our fairy name quiz creates a shareable moment of joy.
Compare your fairy twin with friends, try different names, and find out
which magical fairy represents you!
```

**可选亮点卡片（3 列网格）**：

| 卡片 | 图标建议 | 标题 | 描述 |
|------|---------|------|------|
| 1 | `Sparkles` | 300+ Unique Fairies | Every fairy has a unique name, title, and magical power |
| 2 | `Zap` | Instant Match | Enter your name and get your fairy identity in seconds |
| 3 | `Share2` | Share & Compare | Share your fairy twin with friends and compare results |

**复用**：
- 现有 landing-page.tsx 的 "about" section 模式（eyebrow + h2 + description + 卡片网格）
- Motion 动画（whileInView fadeIn）
- 白色卡片 + ambient-shadow 样式

**实现优先级**：✅ MVP 必须实现 — H2 标题 + 2-3 段文案是 SEO 的关键内容信号

**MVP 核心区块**：Hero + Result + How It Works + What Is + FAQ
**轻量区块**：Social Proof / Bottom CTA（简单文案即可）
**未来扩展区块**：Gallery / Testimonials / AI CTA（Phase 2+）

---

## 10. SEO 方案

### 10.1 Phase 1 基础 SEO

| 元素 | 内容 |
|------|------|
| `<title>` | "Rainbow Magic Fairy Name Finder — Find Your Fairy Name" |
| `<meta name="description">` | "Enter your name and discover your Rainbow Magic fairy name! Free fairy name quiz — find your fairy identity and share with friends." |
| `<h1>` | "Find Your Rainbow Magic Fairy Name" |
| Canonical | `https://[新域名]/` |
| Heading 层次 | H1 (hero) → H2 (sections) → H3 (items) |
| 语义化 HTML | `<section>` / `<main>` / `<header>` / `<footer>` / `<nav>` |
| 可爬取内容 | FAQ 问答文本（SSR 渲染）|

### 10.2 核心关键词（Phase 1 目标）

- `rainbow magic fairy name finder`
- `find your rainbow magic fairy name`
- `fairy name quiz`
- `rainbow magic fairy name`
- `what rainbow magic fairy am I`

### 10.3 未来 SEO 扩展（Phase 1 之后，仅记录不实现）

- Programmatic SEO 页面：`/fairy/[name]`（如 `/fairy/abigail`）
- 每个 Fairy 有独立页面，含图片、描述、关联关键词
- Sitemap 动态生成所有 Fairy 页面
- Schema.org 结构化数据

> ⚠️ 以上仅为记录，Phase 1 不实现。

---

## 11. Cloudflare / 现有模板安全注意事项

### 11.1 不要修改的文件

| 文件 | 原因 |
|------|------|
| `vite.config.ts` | Cloudflare 插件 + TailwindCSS 配置，改动风险大 |
| `react-router.config.ts` | SSR 配置，无需修改 |
| `workers/app.ts` | Worker 入口，无需修改 |
| `tsconfig.*.json` | TypeScript 配置，无需修改 |
| `app/entry.server.tsx` | SSR 入口，无需修改 |
| `app/features/document/index.tsx` | HTML 文档壳，仅可能微调 theme 属性 |

### 11.2 需要谨慎修改的文件

| 文件 | 注意点 |
|------|------|
| `wrangler.jsonc` | 仅修改 `name` 和 `routes`，不要改 bindings 结构 |
| `app/root.tsx` | 保留 Layout 组件结构，仅修改 App 组件内部 |
| `app/routes.ts` | 注释而非删除不需要的路由 |
| `app/app.css` | 仅修改主题变量值，不改结构 |
| `package.json` | 仅修改 `name`，不添加新依赖 |

### 11.3 部署安全检查

每完成一个 Step 后，执行：
```bash
pnpm run build
```
确认构建通过。在 Step 10 之后执行完整的本地预览：
```bash
pnpm run preview
```

---

## 12. 风险与反模式

### 12.1 严禁的做法

| 反模式 | 为什么危险 |
|--------|-----------|
| 🚫 从零新建项目 | 浪费现有基础设施，引入部署风险 |
| 🚫 引入 Gemini / OpenAI API 调用 | Phase 1 不需要 AI |
| 🚫 用 AI 生成 Fairy 匹配结果 | Phase 1 使用确定性哈希映射 |
| 🚫 添加数据库读写 | Phase 1 纯前端静态数据 |
| 🚫 添加用户认证 | Phase 1 不需要 |
| 🚫 安装新的 npm 依赖 | 现有依赖已足够 |
| 🚫 大规模重构布局组件 | 复用，不重写 |
| 🚫 删除现有文件而非注释 | 保留回退路径 |

### 12.2 常见陷阱

| 陷阱 | 如何避免 |
|------|---------|
| 结果卡片太简陋 | 投入最多 UI 精力在 ResultCard 上，必须好看到想截图 |
| 忽视移动端 | 所有开发 mobile-first，用 `md:` 断点扩展 |
| 外部图片挂掉 | 必须有 onerror fallback 处理 |
| 哈希函数非确定性 | 使用经典的 djb2 算法，避免 `Math.random()` |
| 输入验证缺失 | 处理空输入、纯空格、特殊字符 |
| Header/Footer 残留旧品牌 | 系统性替换所有品牌相关文案 |
| 构建失败后继续开发 | 每一步结束必须确认 `pnpm run build` 通过 |

---

## 13. Codex 交接指令

### 开始工作前

1. **先检查，再动手**：阅读 Step 0 中列出的所有文件，理解现有结构
2. **确认构建**：运行 `pnpm run build` 确认基线可用
3. **阅读本文档**：完整阅读本执行计划，理解每一步的目标和边界

### 工作流程

1. **严格按照 Step 0 → Step 12 顺序执行**
2. **每一步完成后**：
   - 报告本步骤修改/新增/删除的文件列表
   - 说明复用了哪些现有结构
   - 说明添加了哪些新内容
   - 说明做了哪些权衡/取舍
   - 运行 `pnpm run build` 确认构建通过
3. **遇到阻塞时**：
   - 如果某个现有文件的结构与预期不符，先报告，再调整方案
   - 如果构建失败，先回退本步骤修改，分析原因
4. **保持变更最小化**：
   - 每个 PR（或逻辑步骤）只做一件事
   - 优先注释而非删除
   - 新增文件放在 `app/features/fairy-finder/` 下，保持隔离

### 质量标准

- 所有 TypeScript 代码必须类型安全（不使用 `any`）
- 所有组件必须在移动端可用
- 结果卡片必须在视觉上令人兴奋（这是产品核心）
- `pnpm run build` 零错误零警告
- 页面首屏加载无明显延迟

### 文件组织

```
app/features/fairy-finder/
├── components/
│   ├── input-section.tsx
│   ├── result-card.tsx
│   ├── fairy-image.tsx
│   ├── share-actions.tsx
│   └── generate-again-button.tsx
├── data/
│   ├── types.ts
│   └── fairies.ts
├── utils/
│   └── match.ts
├── fairy-site-layout.tsx
├── landing-page.tsx
└── i18n.ts
```

---

*本文档由高级工程架构师编写，供 Codex 作为 Phase 1 MVP 实施的唯一执行参考。如有任何不明确之处，优先选择更简单、更安全的实现方式。*

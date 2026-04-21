# Rainbow Magic Fairy Name Finder — Phase 1 MVP 执行计划 V2

> **目的**：本文档是 Codex 的唯一实施参考。所有实施工作按此文档执行。
> **核心原则**：先加后改，隔离新增，最后接线。
> 生成日期：2026-04-09（V2）

---

## 0. 命名规范（全文档统一）

在开始之前，确认以下命名约定。整个文档和实施过程中必须一致使用。

| 用途 | 名称 | 使用位置 |
|------|------|---------|
| 内部项目名 | `fairy-finder` | 目录名、文件名、代码 import 路径 |
| 对外产品名 | **Rainbow Magic Fairy Name Finder** | `<title>`、meta、Footer、Header logo 文字 |
| 首页主标题 (H1) | **Find Your Rainbow Magic Fairy Name** | Hero section H1 |
| 首页副标题 | *Enter your name and discover your fairy identity!* | Hero section subtitle |

**禁止使用的命名变体**（Codex 不应出现这些表述）：
- ~~Fairy Identity Finder~~ — 不用作产品名
- ~~Find your fairy twin~~ — 不用于 H1 或 meta
- ~~Fairy Name Quiz~~ — 仅用于 SEO 关键词覆盖，不用作产品名

---

## 1. 项目目标

### 1.1 业务目标

构建 **Rainbow Magic Fairy Name Finder** 的 Phase 1 MVP：一个基于名字输入的轻互动工具，通过确定性匹配为用户分配一个 Fairy 角色并生成可分享的结果卡片。

**目标**：
- 获取 SEO 搜索流量（"rainbow magic fairy name finder" 等关键词）
- 验证社交分享传播率（结果卡片截图 → UGC）

### 1.2 技术目标

- 在现有 React Router + Cloudflare Workers 模板上**纯增量修改**
- 所有新代码隔离在 `app/features/fairy-finder/` 目录内
- 纯前端确定性匹配逻辑，无后端 API 依赖
- 保留 Cloudflare 完整部署兼容性

### 1.3 成功标准

| 指标 | 目标 |
|------|------|
| 核心流程 | 输入名字 → 3 秒内看到结果卡片 |
| 结果卡片 | 视觉精美，用户愿意主动截图分享 |
| SEO | 首页 H1 / meta / 长文内容覆盖核心关键词 |
| 构建部署 | `pnpm run build` 零错误 |

---

## 2. 实施上下文

### 2.1 现有代码库

当前代码库是一个已部署在 Cloudflare Workers 上的 **React Router v7 + Vite + TailwindCSS v4 + DaisyUI** 全栈应用模板（原项目为 LinkedIn Translator）。

| 层级 | 技术 |
|------|------|
| 框架 | React Router v7（SSR 模式） |
| 构建 | Vite + `@cloudflare/vite-plugin` |
| 样式 | TailwindCSS v4 + DaisyUI v5 + 自定义 CSS 主题变量 |
| 动画 | Motion (Framer Motion) |
| 图标 | Lucide React |
| 状态管理 | Zustand |
| 部署 | Cloudflare Workers + D1 + KV |

### 2.2 旧代码处理原则

> **Phase 1 默认规则：不删除任何旧模块。**

| 类别 | 规则 |
|------|------|
| 旧功能模块（linkedin-translator, oauth, store/user 等） | **保留，不删除，不使用** |
| 旧路由（api, webhooks, callback, base） | **保留，不删除**。仅在接线阶段修改 `routes.ts` 和 `home.tsx` 的引用指向 |
| 旧布局组件（MarketingHeader, Footer, PublicSiteLayout） | **可复用**，通过新的包装组件传入不同 props |
| `root.tsx` | **最小化修改**。仅在最后接线阶段注释 auth bootstrap |
| 旧配置和 bindings | **保留**。D1/KV 绑定留着不影响构建 |

**为什么不删除**：
- 减少构建破坏风险
- 保留回退路径
- MVP 验证后再做清理更安全

### 2.3 不可修改的文件

| 文件 | 原因 |
|------|------|
| `vite.config.ts` | Cloudflare 插件 + TailwindCSS 配置 |
| `react-router.config.ts` | SSR 配置 |
| `workers/app.ts` | Worker fetch handler |
| `tsconfig.*.json` | TypeScript 配置体系 |
| `app/entry.server.tsx` | SSR 入口 |

---

## 3. 输入材料

### 3.1 PRD 要点

- **Phase 1**：名字输入 → 确定性 Fairy 匹配 → 结果卡片 → 分享 + 再生成
- **Phase 2**（不实现）：AI 生成自定义 Fairy
- 核心用户：12-30 岁社交媒体用户
- **结果卡片是产品的核心**

### 3.2 Fairy 数据

`doc/books_data.json`：**326 条**记录，结构如下：

```json
{
  "index": 1,
  "title": "Abigail the Breeze Fairy",
  "image_url": "https://orchardseriesbooks.co.uk/wp-content/uploads/2018/11/9781843626343-197x300.jpg",
  "raw_image_url": "..."
}
```

注意事项：
- `title` 格式为 `"[Name] the [Title] Fairy"`，需解析拆分
- 存在少量重复（如 index 67/68），需按 `title` 去重
- 无 `tags` / `description` 字段，Phase 1 不需要

### 3.3 外部图片依赖风险

> ⚠️ **所有 fairy 图片来自外部域名** `orchardseriesbooks.co.uk`。

| 风险 | 应对 |
|------|------|
| 外部服务器不可用或限流 | FairyImage 组件必须有 onerror fallback（显示 emoji 或默认占位图） |
| 图片 URL 可能变更 | Phase 1 可接受，后续版本应考虑本地缓存或 R2 存储 |
| 跨域限制 | 仅影响 Canvas 操作（如截图导出），不影响 `<img>` 显示 |
| 图片尺寸不统一 | 用 `object-cover` + 固定容器尺寸解决 |

Phase 1 直接使用外部 URL，但 FairyImage 组件**必须**实现 loading + error 状态。

### 3.4 Codex 实施前检查清单

在写任何代码前，Codex 应当：
1. 运行 `pnpm install` 确认依赖正常
2. 运行 `pnpm run build` 确认基线构建通过
3. 浏览 `app/routes.ts` 了解路由结构
4. 浏览 `app/app.css` 了解主题变量
5. 浏览 `app/features/layout/base-layout/public-site-layout.tsx` 了解页面壳层

---

## 4. Phase 1 功能边界

### IN SCOPE

| 功能 | 说明 |
|------|------|
| Hero + 名字输入 | H1 + 副标题 + input + CTA 按钮 |
| 确定性匹配 | `hash(normalize(name)) % FAIRY_LIST.length` |
| 结果卡片 | Fairy 图片 + 名字 + 情绪文案 |
| 分享 | Web Share API + Copy Link 降级 |
| 再生成 | 清空输入 + 滚动回顶部 |
| How It Works | 3 步说明 |
| What Is | 产品介绍 + SEO 长文内容 |
| FAQ | 3-5 个问答 |
| 基础 SEO | title / meta / H1 / canonical |

### OUT OF SCOPE

| 功能 | 原因 |
|------|------|
| ❌ AI 生成 Fairy | Phase 2 |
| ❌ "Create your own fairy" | Phase 2（仅留占位文案） |
| ❌ 上传头像对比 | Phase 2 |
| ❌ 用户登录 / 认证 | 不需要 |
| ❌ 数据库 / KV 读写 | 纯前端 |
| ❌ 支付 / 订阅 | 不需要 |
| ❌ Programmatic SEO 页面 | 后续 SEO 扩展 |
| ❌ 多语言 / 中文 | Phase 1 仅英文 |
| ❌ 删除旧模块 | MVP 之后再清理 |

---

## 5. 工程原则

1. **先加后改**：先在隔离目录创建所有新文件，最后才修改 `routes.ts` 和 `home.tsx` 接线
2. **隔离新增**：所有新代码放在 `app/features/fairy-finder/`，不修改旧功能模块
3. **不删旧代码**：旧模块保留不动，仅改变引用指向
4. **Mobile-first**：UI 先设计移动端，用 `md:` 断点扩展
5. **结果卡片为王**：投入最多 UI 精力在 ResultCard，必须好看到想截图
6. **零新依赖**：不安装新 npm 包，现有依赖已覆盖全部需求
7. **构建守护**：每步完成后 `pnpm run build` 确认通过

---

## 6. 实施步骤（安全优先顺序）

### Step 0：检查代码库 & 确认构建

**目标**：确认现有模板可构建，理解可复用结构。

**操作**：
1. `pnpm install`
2. `pnpm run build` — 必须通过
3. 浏览以下文件并记录关键信息：
   - `app/routes.ts` — 路由结构
   - `app/root.tsx` — 根组件结构
   - `app/app.css` — 主题变量
   - `app/features/layout/base-layout/public-site-layout.tsx` — 页面壳层
   - `app/features/layout/base-layout/marketing-header.tsx` — 导航头部
   - `app/features/layout/base-layout/footer.tsx` — 页脚
   - `app/features/linkedin-translator/landing-page.tsx` — 参照 section 模式

**修改文件**：无
**完成标准**：构建通过 + 已理解现有结构

---

### Step 1：创建 Fairy 数据模块（隔离新增）

**目标**：在 `app/features/fairy-finder/` 下创建数据层，不修改任何现有文件。

**新增文件**：
```
app/features/fairy-finder/data/types.ts
app/features/fairy-finder/data/fairies.ts
```

**types.ts**：
```typescript
export interface FairyData {
  id: number;
  name: string;        // "Abigail"
  title: string;       // "the Breeze Fairy"
  fullTitle: string;   // "Abigail the Breeze Fairy"
  imageUrl: string;
}
```

**fairies.ts**：
- 从 `doc/books_data.json` 转化为 `FairyData[]` 静态数组
- 按 `fullTitle` 去重（保留首次出现的条目）
- 解析 `title` 字段：第一个空格前 = name，之后 = title
- 导出 `FAIRY_LIST` 和 `FAIRY_COUNT`

**修改文件**：无（纯新增）
**完成标准**：`pnpm run build` 通过，新模块可正常 import

---

### Step 2：创建确定性匹配逻辑（隔离新增）

**目标**：实现 `matchFairy(name) → FairyData` 纯函数。

**新增文件**：
```
app/features/fairy-finder/utils/match.ts
```

**实现要求**：
```typescript
// 规范化：trim → lowercase → 仅保留 a-z
function normalizeName(input: string): string

// 确定性哈希（djb2 算法，无符号）
function hashString(str: string): number

// 匹配：normalize → hash → mod → lookup
function matchFairy(name: string): FairyData
// 空输入 fallback 到 FAIRY_LIST[0]
```

**关键约束**：
- 必须确定性：相同输入 → 相同输出
- 禁止 `Math.random()`
- 空输入返回 fallback，不抛错

**修改文件**：无（纯新增）
**完成标准**：`pnpm run build` 通过

---

### Step 3：创建着陆页组件 — 页面壳层 + Hero + 输入区（隔离新增）

**目标**：创建完整的着陆页组件，但暂不连接到路由。此时页面只存在于代码中，还无法通过 URL 访问。

**新增文件**：
```
app/features/fairy-finder/i18n.ts                    # 所有文案集中管理
app/features/fairy-finder/fairy-site-layout.tsx       # 页面壳层（包装 Header + Footer）
app/features/fairy-finder/components/input-section.tsx
app/features/fairy-finder/landing-page.tsx            # 主页面组件
```

**fairy-site-layout.tsx**：
- 组合 `MarketingHeader` + `Footer`，传入 fairy-finder 的品牌 props
- Logo 文字：`"Rainbow Magic Fairy Name Finder"`
- 移除登录按钮（不传 signInLabel 或使用简化版 header）
- Footer 品牌名和描述更新为 fairy-finder 相关

**landing-page.tsx — Hero section**：
- Eyebrow badge：`"✨ Rainbow Magic"`
- H1：`"Find Your Rainbow Magic Fairy Name"`（与 §0 命名规范一致）
- Subtitle：`"Enter your name and discover your fairy identity!"`
- 内嵌 InputSection 组件

**input-section.tsx**：
- 受控 `<input type="text">`
- 非空验证
- 提交回调 `onSubmit(name: string)`

**i18n.ts**：
- 集中管理所有页面文案（hero、how it works、what is、faq、cta、navbar、footer）
- 产品名统一使用 `"Rainbow Magic Fairy Name Finder"`

**UI 参照**：复用现有 `landing-page.tsx` 的 section 间距、TailwindCSS 类名模式、motion 动画模式。

**修改文件**：无（纯新增）
**完成标准**：`pnpm run build` 通过（组件存在但未路由挂载）

---

### Step 4：实现结果卡片（隔离新增）

**目标**：创建产品核心组件——视觉精美的 Fairy 结果卡片。

**新增文件**：
```
app/features/fairy-finder/components/result-card.tsx
app/features/fairy-finder/components/fairy-image.tsx
```

**ResultCard 结构**：
```
┌─────────────────────────────┐
│      ✨ Fairy Image ✨       │
│     (圆角 + 阴影 + 光晕)     │
│                             │
│   "This is literally you"   │  ← 情绪文案（从预设列表选取）
│                             │
│   Abigail the Breeze Fairy  │  ← Fairy 全名
│                             │
│  "Does she look like you?"  │
│                             │
│  [Share] [Try Another Name] │
└─────────────────────────────┘
```

**FairyImage 组件必须实现**：
- loading skeleton
- `onerror` fallback（显示 ✨ emoji + fairy 名字）
- `object-cover` + 固定容器尺寸

**关键设计要求**：
- 卡片背景使用渐变或玻璃效果（glassmorphism）
- 入场动画（motion: fadeIn + scale）
- 截图后单独看仍然好看（自包含视觉完整性）

**情绪文案预设列表**（从中根据 hash 确定性选取一条）：
- "This is literally you"
- "Why does this match you so well?"
- "Is this your fairy twin?"
- "You've found your fairy identity!"
- "This fairy was made for you"

**修改文件**：无（纯新增）
**完成标准**：`pnpm run build` 通过

---

### Step 5：实现分享 + 再生成（隔离新增）

**目标**：创建分享和再生成组件。

**新增文件**：
```
app/features/fairy-finder/components/share-actions.tsx
app/features/fairy-finder/components/generate-again-button.tsx
```

**share-actions.tsx**：
- 检测 `navigator.share` 可用性
- 可用时：调用 Web Share API（title / text / url）
- 不可用时：Copy Link 按钮（`navigator.clipboard.writeText`）
- 复制成功后显示 "Copied!" 临时反馈（2 秒后消失）
- 图标使用 `lucide-react` 的 `Share2` / `Copy`

**generate-again-button.tsx**：
- "Try Another Name" 按钮
- 点击行为：清空结果 → 清空输入 → smooth scroll 到输入区 → focus 输入框
- 次要样式（outline），不抢结果卡片的视觉焦点

**修改文件**：无（纯新增）
**完成标准**：`pnpm run build` 通过

---

### Step 6：组装完整着陆页（修改 landing-page.tsx）

**目标**：将 Step 1-5 的所有组件组装到 `landing-page.tsx` 中，实现完整的用户流程。

**修改文件**：
- `app/features/fairy-finder/landing-page.tsx` [修改]

**组装逻辑**：
1. 用户输入名字 → `matchFairy(name)` → 设置 `result` 状态
2. `result` 不为 null 时，显示 ResultCard + ShareActions + GenerateAgainButton
3. 结果区加入 smooth scroll 和入场动画

**同时补充以下内容区块**（参照现有 landing-page.tsx 的 section 模式）：

| 区块 | H2 标题 | 说明 |
|------|---------|------|
| How It Works | "How It Works" | 3 步说明（Enter Name → Discover Fairy → Share） |
| What Is | "What Is Rainbow Magic Fairy Name Finder?" | 2-3 段 SEO 长文 + 可选 3 列亮点卡片 |
| FAQ | "Frequently Asked Questions" | 3-5 个问答（手风琴动画） |
| Bottom CTA | "Ready to Find Your Fairy Name?" | 滚动到顶部的 CTA 按钮 |
| Phase 2 占位 | — | 一行灰色文案："Want to create your own fairy? Coming soon!" |

**"What Is" 区块内容要点**：
- 段落 1：产品定义（what this tool does）
- 段落 2：Rainbow Magic 系列背景（300+ fairies, Daisy Meadows）
- 段落 3：为什么有趣（identity + sharing + fun）
- 可选 3 列卡片：300+ Unique Fairies / Instant Match / Share & Compare

**复用**：
- 现有 landing-page.tsx 的 section 排列、motion 动画、FAQ 手风琴模式
- TailwindCSS 主题变量

**完成标准**：
- landing-page.tsx 可独立渲染完整页面内容
- 所有交互（输入 → 结果 → 分享 → 再生成）闭环
- `pnpm run build` 通过

---

### Step 7：接线 — 连接路由（首次修改现有文件）

**目标**：将新的着陆页连接到首页路由，使其通过 URL 可访问。

> ⚠️ 这是首次修改现有文件。仔细操作。

**修改文件**：
- `app/routes/home.tsx` [修改]
- `app/root.tsx` [最小修改]

**home.tsx 修改**：
```
变更前：import LinkedinTranslatorLandingPage → 渲染旧着陆页
变更后：import FairyFinderLandingPage → 渲染新着陆页
```
- 同时更新 `meta` 函数：
  - title：`"Rainbow Magic Fairy Name Finder — Find Your Fairy Name"`
  - description：`"Enter your name and discover your Rainbow Magic fairy name! Free fairy name quiz — find your fairy identity and share with friends."`
  - Canonical URL 更新

**root.tsx 修改**（最小化）：
- 注释掉 App 组件中的 auth bootstrap `useEffect`（6 行注释）
- 保留 `<Outlet />` 渲染
- **不改动** Layout 组件和 loader

**不修改 routes.ts**：旧路由全部保留。由于 `home.tsx` 仍然是 index 路由，只需修改它的 import 指向即可。旧的 api / webhooks / base 路由留着，不影响新功能。

**完成标准**：
- 访问 `/` 显示 Rainbow Magic Fairy Name Finder 着陆页
- 完整用户流程可用
- `pnpm run build` 通过
- 旧路由（/api, /base 等）仍存在，不报错

---

### Step 8：主题色调整

**目标**：将主色调从蓝色系调整为 Fairy / Magic 风格。

**修改文件**：
- `app/app.css` [修改 — 仅改变量值]

**变更**：
```css
/* 仅修改以下变量值 */
--color-primary: #8b5cf6;           /* 紫色系 */
--color-primary-container: #7c3aed;
--color-secondary-fixed: #ede9fe;   /* 浅紫配套 */
```

**关键**：仅修改变量值，不改 CSS 结构。

**完成标准**：页面整体色调符合 Magic 风格，`pnpm run build` 通过

---

### Step 9：SEO 完善

**目标**：确保搜索引擎可正确索引首页。

**修改文件**：
- `app/routes/home.tsx` [修改 — meta 函数，如果 Step 7 未完成则在此步完成]
- `app/routes/_meta/[sitemap.xml].tsx` [修改 — 更新 sitemap]

**复用**：`app/utils/meta.ts` 中的 `createCanonical` / `createAlternate`

**SEO 配置**：

| 元素 | 值 |
|------|-----|
| `<title>` | `Rainbow Magic Fairy Name Finder — Find Your Fairy Name` |
| `<meta name="description">` | `Enter your name and discover your Rainbow Magic fairy name! Free fairy name quiz — find your fairy identity and share with friends.` |
| `<h1>` | `Find Your Rainbow Magic Fairy Name` |
| Canonical | `https://[域名]/` |
| H 层次 | H1(hero) → H2(What Is / How It Works / FAQ) → H3(items) |
| 可爬取内容 | "What Is" 长文 + FAQ 问答（SSR 渲染） |

**核心关键词**：
- `rainbow magic fairy name finder`
- `find your rainbow magic fairy name`
- `fairy name quiz`
- `what rainbow magic fairy am i`

**未来 SEO 扩展（仅记录，Phase 1 不实现）**：
- Programmatic pages: `/fairy/[name]`
- Schema.org 结构化数据

**完成标准**：`<title>` / `<meta>` / `<h1>` 正确，sitemap 可访问

---

### Step 10：最终 QA

**目标**：逐条验证 MVP 完整性。

**检查清单**：
- [ ] 输入名字 → 显示 Fairy 结果
- [ ] 相同名字 → 始终相同结果（确定性）
- [ ] 结果卡片包含：Fairy Image / Fairy Name / 情绪文案 / 分享按钮 / 再生成按钮
- [ ] 分享功能正常（移动端 Web Share + 桌面端 Copy Link）
- [ ] "Try Another Name" → 清空 + 滚动 + focus
- [ ] Hero H1 = "Find Your Rainbow Magic Fairy Name"
- [ ] "What Is" 区块含 H2 + 2-3 段长文内容
- [ ] FAQ 手风琴展开/收起正常
- [ ] 图片 onerror fallback 正常
- [ ] 移动端 / 桌面端响应式布局正确
- [ ] SEO meta 信息正确
- [ ] `pnpm run build` 零错误
- [ ] 无控制台错误

---

## 7. 数据集成方案

### 7.1 文件位置

```
app/features/fairy-finder/data/
├── types.ts      # FairyData 接口
└── fairies.ts    # 静态数据数组
```

使用 TypeScript 模块而非直接 import JSON：编译时去重 + 类型安全 + 预拆分 name/title。

### 7.2 数据转换规则

| 源字段 | 处理 | 目标字段 |
|--------|------|---------|
| `title` | 取第一个空格前 | `name` |
| `title` | 取第一个空格后 | `title` |
| `title` | 原值 | `fullTitle` |
| `title` | 按值去重，保留首次 | （去重） |
| `image_url` | 直接映射 | `imageUrl` |
| `index` | 直接映射 | `id` |

### 7.3 匹配逻辑（djb2 算法）

```typescript
function normalizeName(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, '');
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function matchFairy(name: string): FairyData {
  const normalized = normalizeName(name);
  if (!normalized) return FAIRY_LIST[0];
  return FAIRY_LIST[hashString(normalized) % FAIRY_LIST.length];
}
```

**为什么确定性映射**：可复现（同名同结果）、可分享（朋友可验证）、无后端、可测试。

---

## 8. UI 组件清单

所有组件位于 `app/features/fairy-finder/components/`。

| 组件 | 文件名 | MVP 行为 | 可延迟 |
|------|--------|---------|--------|
| **InputSection** | `input-section.tsx` | 受控输入 + 非空验证 + 提交回调 | 自动补全 |
| **ResultCard** | `result-card.tsx` | Fairy 图片 + 名字 + 情绪文案 + 入场动画 | Canvas 导出 |
| **FairyImage** | `fairy-image.tsx` | `<img>` + loading skeleton + onerror fallback | 预加载优化 |
| **ShareActions** | `share-actions.tsx` | Web Share API + Copy Link 降级 | 社交平台直链 |
| **GenerateAgainButton** | `generate-again-button.tsx` | 清空 + scroll + focus | — |

Phase 2 占位（不需要独立组件）：一行内联文案 `"Want to create your own fairy? Coming soon!"`

---

## 9. 着陆页结构

```
┌──────────────────────────────────────┐
│ Header                               │  ← fairy-site-layout（精简版 MarketingHeader）
│ Logo: "Rainbow Magic Fairy Name      │
│        Finder"                       │
├──────────────────────────────────────┤
│ HERO                                 │  ← ✅ 核心
│ Eyebrow: "✨ Rainbow Magic"          │
│ H1: "Find Your Rainbow Magic        │
│      Fairy Name"                     │
│ Subtitle: "Enter your name and      │
│  discover your fairy identity!"      │
│ [Input Name] [Find My Fairy →]       │
├──────────────────────────────────────┤
│ RESULT (初始隐藏)                     │  ← ✅ 核心
│ - ResultCard                         │
│ - ShareActions                       │
│ - GenerateAgainButton                │
│ - Phase 2 占位文案                    │
├──────────────────────────────────────┤
│ HOW IT WORKS                         │  ← ✅ 轻量
│ 1. Enter Your Name                   │
│ 2. Discover Your Fairy Name          │
│ 3. Share With Friends                │
├──────────────────────────────────────┤
│ WHAT IS                              │  ← ✅ SEO 关键
│ H2: "What Is Rainbow Magic Fairy     │
│      Name Finder?"                   │
│ - 2-3 段 SEO 长文                     │
│ - 可选 3 列亮点卡片                   │
├──────────────────────────────────────┤
│ FAQ                                  │  ← ✅ SEO
│ 3-5 个问答（手风琴）                  │
├──────────────────────────────────────┤
│ BOTTOM CTA                           │  ← 轻量
│ "Ready to Find Your Fairy Name?"     │
│ [Find My Fairy →]                    │
├──────────────────────────────────────┤
│ Footer                               │  ← 复用现有 Footer
│ Brand: "Rainbow Magic Fairy Name     │
│         Finder"                      │
└──────────────────────────────────────┘
```

**区块优先级**：
- ✅ 必须精做：Hero + Result + What Is + FAQ
- 轻量即可：How It Works + Bottom CTA
- Phase 2+：Gallery / Testimonials / AI CTA

---

## 10. SEO 方案

见 Step 9。补充说明：

**页面 SEO 内容信号**：
1. H1 包含核心关键词（`Find Your Rainbow Magic Fairy Name`）
2. "What Is" 区块提供 2-3 段长文（SSR 渲染，可爬取）
3. FAQ 问答提供额外的关键词覆盖
4. `<title>` 和 `<meta description>` 精准匹配搜索意图

**后续 SEO 扩展（仅记录）**：
- `/fairy/[name]` programmatic pages
- Schema.org 结构化数据
- sitemap 动态生成

---

## 11. Cloudflare 安全注意事项

| 规则 | 说明 |
|------|------|
| **不改构建配置** | `vite.config.ts` / `react-router.config.ts` / `tsconfig` 不碰 |
| **不改 Worker 入口** | `workers/app.ts` / `entry.server.tsx` 不碰 |
| **不删旧代码** | 旧模块保留，不引用即可 |
| **最小化改现有文件** | 仅 `home.tsx`（import 指向）+ `root.tsx`（注释 auth）+ `app.css`（变量值） |
| **构建守护** | 每步完成后 `pnpm run build`，失败则回退 |
| **wrangler.jsonc** | 仅改 `name`，不改 bindings 结构。域名路由后续配置 |

---

## 12. 风险与反模式

### 严禁

| 🚫 反模式 | 原因 |
|-----------|------|
| 从零新建项目 | 破坏现有部署 |
| 引入 Gemini / OpenAI API | Phase 1 不需要 AI |
| 用 AI 生成 Fairy 匹配 | Phase 1 使用确定性哈希 |
| 添加 npm 依赖 | 现有依赖已足够 |
| 删除旧模块 | 保留回退路径 |
| 早期修改 root.tsx / routes.ts | 先完成隔离新增，最后接线 |

### 常见陷阱

| 陷阱 | 解决 |
|------|------|
| 结果卡片太简陋 | MVP 核心，必须精美到想截图 |
| 忽视移动端 | mobile-first 开发 |
| 外部图片挂掉无 fallback | FairyImage 必须有 onerror |
| H1 / title / 文案命名不一致 | 严格参照 §0 命名规范 |
| Header/Footer 残留旧品牌 | 通过 fairy-site-layout 传入新 props |
| 构建失败后继续开发 | 每步 build，失败即回退 |

---

## 13. Codex 工作指令

### 工作流程

```
Step 0  检查 & 确认构建         ← 不改任何文件
Step 1  创建数据模块            ← 纯新增
Step 2  创建匹配逻辑            ← 纯新增
Step 3  创建页面组件            ← 纯新增
Step 4  创建结果卡片            ← 纯新增
Step 5  创建分享 & 再生成       ← 纯新增
Step 6  组装完整着陆页          ← 修改新文件
Step 7  接线到路由              ← 首次改现有文件（home.tsx + root.tsx）
Step 8  主题色调整              ← 改 app.css 变量值
Step 9  SEO 完善                ← 改 meta + sitemap
Step 10 最终 QA                 ← 验证
```

### 每步完成后报告

每完成一步，报告以下信息：
1. 新增/修改的文件列表
2. 复用了哪些现有结构
3. `pnpm run build` 是否通过

### 质量标准

- TypeScript 类型安全（不用 `any`）
- 产品名统一使用 `"Rainbow Magic Fairy Name Finder"`
- H1 统一使用 `"Find Your Rainbow Magic Fairy Name"`
- 所有组件 mobile-first
- 结果卡片视觉精美
- `pnpm run build` 零错误

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

*本文档 V2 由高级工程架构师编写。Codex 应严格按照 Step 0-10 顺序执行，先加后改，隔离新增，最后接线。遇到不确定的选择时，优先选择更简单、更安全的方案。*

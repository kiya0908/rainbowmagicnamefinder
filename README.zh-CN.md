# LinkedIn Translator - 领英语调转换器

LinkedIn Translator 不是普通的语言翻译工具，而是一款面向职场表达的 AI **语调转换器（Linkedin Translator）**。

它可以把日常大白话快速改写成更专业、更吸引人的 LinkedIn speak，用于领英动态、个人简介、简历描述等场景。

[English](README.md) | [中文](README.zh-CN.md) | [在线访问](https://linkedinspeaktranslator.top)

- 网站：`https://linkedinspeaktranslator.top`
- 支持邮箱：`support@linkedinspeaktranslator.top`

## 核心定位

LinkedIn Translator 是一款领先的 AI-powered LinkedIn speak translator。不同于传统的翻译工具，这款专业的 English to LinkedIn translator 专注于将你的日常描述转化为高质量的 professional LinkedIn posts。无论你是想润色简历还是发布动态，LinkedIn Translator 都能精准捕捉职场精髓。

## 差异化优势

- 它不是逐字翻译，而是针对语气和表达方式的智能重写。
- 相比 Google Translate 或 Kagi Translate，它更理解职场语境和招聘语境。
- 它会自动补全更适合 LinkedIn 的表达结构：
  - 钩子（Hooks）
  - 换行节奏
  - 专业表情

## 功能说明

- **日常口语 -> LinkedIn 职场话术**：把普通表达升级成专业、可信、有影响力的文案。
- **LinkedIn 话术 -> 大白话**：把复杂术语还原成清晰易懂的日常语言。
- **AI 语调优化**：保留原意的同时增强专业度、清晰度和可读性。
- **快速出稿**：输入即改写，秒级复制发布。

## 技术栈

- [React](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)

## 本地开发

### 依赖

- Node.js 18+
- pnpm
- Cloudflare 账号

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在 Cloudflare Dashboard（或本地 `.dev.vars`）中配置：

- `KIEAI_APIKEY`
- `SESSION_SECRET`
- `DOMAIN`（建议：`https://linkedinspeaktranslator.top`）
- `CDN_URL`（如需）

### 3. 启动开发环境

```bash
pnpm run dev
```

打开 `http://localhost:5173`。

### 4. 构建与部署

```bash
pnpm run build
pnpm run deploy
```

## License

MIT，详见 [LICENSE](LICENSE)。

# Rainbow Magic Fairy Name Finder

Rainbow Magic Fairy Name Finder 是一个部署在 Cloudflare Workers 上的名字匹配网站。

用户输入名字后，系统会返回稳定、可复现的 Rainbow Magic Fairy 身份结果，并支持分享。

[English](README.md) | [中文](README.zh-CN.md) | [在线访问](https://rainbowmagicfairyname.online)

- 网站：`https://rainbowmagicfairyname.online`
- 支持邮箱：`support@rainbowmagicfairyname.online`

## 当前状态

- 首页（`/`）已切换为 Fairy Finder。
- 仓库里仍保留部分 LinkedIn 模板遗留路由/模块，用于分阶段安全清理。
- 清理进度见：`LINKEDIN_TRANSLATOR_CLEANUP_IMPLEMENTATION_LOG.md`。

## 技术栈

- React
- React Router v7
- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Tailwind CSS + DaisyUI

## 本地开发

### 前置要求

- Node.js 18+
- pnpm
- Cloudflare 账号

### 安装依赖

```bash
pnpm install
```

### 环境变量

在 Cloudflare Dashboard（或本地 `.dev.vars`）中配置运行变量，例如：

- `SESSION_SECRET`
- `DOMAIN`（建议：`https://rainbowmagicfairyname.online`）
- `CDN_URL`（如需）
- 当前路由所需的其它密钥

### 启动开发环境

```bash
pnpm run dev:cf
```

访问 `http://localhost:5173`。

## 构建与部署

```bash
pnpm run build
pnpm run deploy
```

Cloudflare Workers Builds 建议部署命令：

```bash
pnpm run deploy:versions
```

## 许可证

MIT，详见 [LICENSE](LICENSE)。

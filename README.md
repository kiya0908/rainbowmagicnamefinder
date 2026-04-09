# LinkedIn Translator – Translate Profiles, Posts & Messages Instantly

LinkedIn Translator is not just a language translator. It is an AI-powered **Linkedin Translator** built for workplace communication.

It transforms casual wording into polished, engaging, professional LinkedIn-style copy for posts, profile summaries, and resume descriptions.

[English](README.md) | [中文](README.zh-CN.md) | [Live Site](https://linkedinspeaktranslator.top)

- Website: `https://linkedinspeaktranslator.top`
- Support: `support@linkedinspeaktranslator.top`

## Positioning

LinkedIn Translator is a leading **AI-powered LinkedIn speak translator**.
Unlike traditional translation tools, this professional **English to LinkedIn translator** focuses on turning everyday descriptions into high-quality **professional LinkedIn posts**.

## Why It Is Different

- It is a **tone conversion** product, not a literal translation engine.
- It understands workplace and recruiting context better than general tools such as Google Translate or Kagi Translate.
- It automatically adds LinkedIn-native structure:
  - hooks
  - strategic line breaks
  - professional emojis

## Core Features

- **Human to LinkedIn Speak**: Convert plain text into credible executive-style phrasing.
- **LinkedIn Speak to Plain English**: Decode corporate jargon into clear and simple wording.
- **AI Tone Control**: Keep original intent while upgrading voice, authority, and clarity.
- **Fast Workflow**: Input, transform, and copy in seconds.

## Tech Stack

- [React](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account

### 1. Install

```bash
pnpm install
```

### 2. Configure Environment

Set required variables in Cloudflare (or local `.dev.vars`) such as:

- `KIEAI_APIKEY`
- `SESSION_SECRET`
- `DOMAIN` (recommended: `https://linkedinspeaktranslator.top`)
- `CDN_URL` (if used)

### 2.1 Configure D1 Database

This project is bound to Cloudflare D1 via `wrangler.jsonc`.

- `binding`: `DB`
- `database_name`: `linkedintranslator`
- `database_id`: `4e83da95-b2db-49e3-8017-6c9c284afa8e`

For Drizzle CLI commands (`pnpm run db:generate` / `pnpm run db:migrate`), set:

- `ACCOUNT_ID`
- `ACCOUNT_TOKEN`
- `DATABASE_ID` (same as above)

Apply migrations:

```bash
pnpm run db:migrate:local
pnpm run db:migrate:remote
```

### 2.2 D1 Local-First Workflow (Recommended)

Use local D1 as default during development, and keep only schema/migrations synced to remote.

- Default DB-backed dev command: `pnpm run dev:cf`
- Local D1 state path: `.wrangler/state/v3/d1/`
- Do not copy local business rows (users/orders/credits) into remote manually.

Check where data is being written:

```bash
pnpm run db:check:local
pnpm run db:check:remote
```

Release gate for remote D1 (required tables + migration alignment):

```bash
pnpm run db:gate:remote
```

When schema changes:

```bash
pnpm run db:migrate:local
pnpm run db:migrate:remote
```

Use remote D1 only for integration scenarios (for example payment callback/webhook) or production issue reproduction, then switch back to local-first mode.

### 3. Run Locally

```bash
pnpm run dev:cf
```

Open `http://localhost:5173`.

### 4. Build and Deploy

```bash
pnpm run build
pnpm run deploy
```

### 4.1 Cloudflare Workers Builds (Build + Deploy Commands)

To avoid the `invalid alias: HEAD` error in CI, configure Workers Builds commands as:

Build command:

```bash
pnpm run build
```

Deploy command:

```bash
pnpm run deploy:versions
```

Equivalent direct command:

```bash
npx wrangler versions upload --preview-alias production
```

Do not use the bare command `npx wrangler versions upload` as Deploy command in CI.

## License

MIT. See [LICENSE](LICENSE).

# Rainbow Magic Fairy Name Finder

Rainbow Magic Fairy Name Finder is a Cloudflare-deployed web app for quick, deterministic fairy-name matching.

Users enter a name and get a stable Rainbow Magic fairy identity result that can be shared.

[English](README.md) | [中文](README.zh-CN.md) | [Live Site](https://rainbowmagicfairyname.online)

- Website: `https://rainbowmagicfairyname.online`
- Support: `support@rainbowmagicfairyname.online`

## Project Status

- Homepage (`/`) is Fairy Finder.
- Some legacy LinkedIn template routes/modules are still present for staged cleanup safety.
- Cleanup is executed stage by stage; see `LINKEDIN_TRANSLATOR_CLEANUP_IMPLEMENTATION_LOG.md`.

## Tech Stack

- React
- React Router v7
- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Tailwind CSS + DaisyUI

## Local Development

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account

### Install

```bash
pnpm install
```

### Environment

Configure required variables in Cloudflare Dashboard (or local `.dev.vars`), for example:

- `SESSION_SECRET`
- `DOMAIN` (recommended: `https://rainbowmagicfairyname.online`)
- `CDN_URL` (if used)
- Other runtime secrets used by current routes

### Run

```bash
pnpm run dev:cf
```

Open `http://localhost:5173`.

## Build and Deploy

```bash
pnpm run build
pnpm run deploy
```

For Workers Builds deploy command:

```bash
pnpm run deploy:versions
```

## License

MIT. See [LICENSE](LICENSE).

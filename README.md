# AI Chat Challenge

A technical assessment for a small generative AI chat application. **Phase 1
(project bootstrap) is implemented.** The home and `/chat` routes are placeholders.

## Stack

Next.js App Router, React, strict TypeScript, pnpm, and Material UI with Emotion.
OpenAI SDK and react-markdown are installed for later phases. Testing uses Vitest,
React Testing Library, jest-dom, and jsdom; linting uses ESLint's Next.js presets.

## Local setup

Use Node.js 22.15+ within Node 22, or Node.js 24+, and pnpm 10.30.3 (pinned in
`package.json`). With Corepack available, run `corepack enable` to expose pnpm.
If pnpm is not on PATH, use `corepack pnpm` in place of `pnpm` below.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. No API key is required for this phase. When integration
is implemented, copy `.env.example` to `.env.local` and configure the server-only
key there. Never use a public environment variable for secrets.

```bash
pnpm lint
pnpm test
pnpm build
pnpm typecheck
```

`pnpm test:watch` starts watch mode. `pnpm start` serves a completed production
build. The current test checks the MUI/App Router testing infrastructure; chat
behavior tests belong to later phases.

## Architecture and remaining work

Server Components are the default. Chat-specific components, hooks, utilities,
and types will be colocated in private folders under `app/chat/`. The planned
backend is a Next.js Route Handler calling OpenAI exclusively on the server.
No separate backend or global state library is needed.

Later phases add the chat form, AI responses, validation, loading and error states,
timeouts, persistence, Clear Chat, Markdown rendering, and behavior tests. None of
these features are implemented yet.

See [architecture](docs/ARCHITECTURE.md), [development status](docs/DEVELOPMENT.md),
and [repository instructions](AGENTS.md).

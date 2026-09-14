# AI Chat Challenge

A technical assessment for a small generative AI chat application. **Phase 2
(static chat UI) is implemented.** Visit `/chat` for the responsive preview.
Send validates the input and shows a preview confirmation; no message is sent.

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
build. Tests cover the MUI/App Router infrastructure and basic chat input behavior.

## Architecture and remaining work

Server Components are the default. Chat-specific components, hooks, utilities,
and types will be colocated in private folders under `app/chat/`. The planned
backend is a Next.js Route Handler calling OpenAI exclusively on the server.
No separate backend or global state library is needed.

Later phases add AI responses, API validation, loading and error states,
timeouts, persistence, Clear Chat, Markdown rendering, and further behavior tests.
These features are not implemented yet.

See [architecture](docs/ARCHITECTURE.md), [development status](docs/DEVELOPMENT.md),
and [repository instructions](AGENTS.md).

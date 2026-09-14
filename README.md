# AI Chat Challenge

A technical assessment for a small generative AI chat application. **Phase 3
(AI integration) is implemented.** Visit `/chat` to submit a prompt and receive
a plain-text AI response without reloading the page.

## Stack

Next.js App Router, React, strict TypeScript, pnpm, and Material UI with Emotion.
The OpenAI SDK handles server requests; react-markdown is reserved for later. Testing uses Vitest,
React Testing Library, jest-dom, and jsdom; linting uses ESLint's Next.js presets.

## Local setup

Use Node.js 22.15+ within Node 22, or Node.js 24+, and pnpm 10.30.3 (pinned in
`package.json`). With Corepack available, run `corepack enable` to expose pnpm.
If pnpm is not on PATH, use `corepack pnpm` in place of `pnpm` below.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`, then open
http://localhost:3000/chat. The server uses `gpt-5.5` through the Responses API;
the key needs access to that model. Restart the development server after changing
environment variables. Never use a public environment variable for secrets.
Tests mock OpenAI and builds do not require a key.

```bash
pnpm lint
pnpm test
pnpm build
pnpm typecheck
```

`pnpm test:watch` starts watch mode. `pnpm start` serves a completed production
build. Tests cover input behavior, API validation, mocked OpenAI calls, safe errors,
and dynamic rendering using mocked fetch responses. They never call the real API.

## Architecture and remaining work

Server Components are the default. Chat-specific components, hooks, utilities,
and types are colocated in private folders under `app/chat/`. The
backend is a Next.js Route Handler calling OpenAI exclusively on the server.
No separate backend or global state library is needed.

`POST /api/chat` accepts `{ "prompt": "..." }` and returns `{ "message": "..." }`.
Invalid input returns HTTP 400; provider/configuration failures return HTTP 500
with a safe `{ "error": "..." }` payload. A `server-only` import guard protects the
OpenAI module. Only the current prompt is sent; displayed exchanges exist in
memory and disappear on refresh. The SDK request sets `store: false`.

Basic pending feedback and a generic failure message support the request flow.
Later phases add full state handling, application timeouts, persistence, Clear Chat,
Markdown rendering, and further behavior tests.

See [architecture](docs/ARCHITECTURE.md), [development status](docs/DEVELOPMENT.md),
and [repository instructions](AGENTS.md).

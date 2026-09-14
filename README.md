# AI Chat Challenge

A technical assessment for a small generative AI chat application. **Phase 7
quality fixes are implemented; manual browser review remains pending.** Visit `/chat` for AI replies with Markdown,
browser-persisted history, and Clear Chat.

## Stack

Next.js App Router, React, strict TypeScript, pnpm, and Material UI with Emotion.
The OpenAI SDK handles server requests; react-markdown renders assistant replies. Testing uses Vitest,
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
build. Twelve focused tests cover the root redirect, input, request success/failure, loading and timeout,
history restoration/reset, malformed storage, and safe API errors. Fetch and
OpenAI are mocked; tests never call the real API.

## Architecture and remaining work

Server Components are the default. Chat-specific components, hooks, utilities,
and types are colocated in private folders under `app/chat/`. The
backend is a Next.js Route Handler calling OpenAI exclusively on the server.
No separate backend or global state library is needed.

`POST /api/chat` accepts `{ "prompt": "..." }` and returns `{ "message": "..." }`.
Invalid input returns HTTP 400; provider/configuration failures return HTTP 500
with a safe `{ "error": "..." }` payload. A `server-only` import guard protects the
OpenAI module. Only the current prompt is sent; displayed exchanges are restored
from this browser's LocalStorage after refresh. The SDK request sets `store: false`.
Clear Chat removes saved and visible history and is disabled during requests.
If storage is blocked or full, the chat still works in memory. User messages remain
plain text; assistant Markdown supports headings, lists, emphasis, code, and links
without raw HTML. History is not sent as context or stored by the application server.

The chat hook prevents duplicate submissions and aborts browser requests after
60 seconds. Valid submissions clear the input immediately. History initialization
shows loading feedback before displaying saved messages or the empty state, and
pending replies show a soft gray message-style skeleton. Safe errors allow a
new submission after failure or timeout. Manual quality review remains pending;
submission has not started.

Opening `/` redirects to `/chat` on the server. The viewport-constrained chat keeps
the composer anchored while long conversations scroll inside the message area.

See [architecture](docs/ARCHITECTURE.md), [development status](docs/DEVELOPMENT.md),
and [repository instructions](AGENTS.md).

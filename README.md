# Live Demo
[View deployed application on Vercel](https://asana-technical-assessment.vercel.app/chat)

# AI Chat Challenge
A small technical interview application for asking questions and continuing an AI
conversation. Opening `/` redirects to `/chat`. Replies render without a page reload,
and completed conversations survive refresh in the same browser.

## Assessment coverage

| Requirement | Implementation |
| --- | --- |
| Text input and submit button | Labeled multiline composer; Enter sends, Shift + Enter adds a line; accepted submissions clear immediately |
| Generative AI and dynamic rendering | Server-only OpenAI Responses API with ordered conversation context; React updates the UI |
| Loading states | MUI skeletons with distinct history-restoration and response-generation status text |
| Empty input, errors, and timeout | Whitespace validation, safe error alerts, duplicate prevention, and a 60-second browser timeout |
| Components and semantic HTML | Focused components with main/header/section/article/form elements and live announcements |
| Responsive design | Viewport-constrained layout, anchored composer, internal message scrolling, mobile controls |
| Bonus: persistence and reset | Validated LocalStorage history; Clear Chat removes visible/saved history and future context |
| Bonus: Markdown | Assistant headings, lists, emphasis, links, inline code, and scrolling code blocks; user text stays plain |
| Bonus: tests | 14 focused tests covering input, state, storage, Markdown, routing, and API contracts |

## Stack and architecture

Next.js App Router, React, strict TypeScript, Material UI/Emotion, OpenAI SDK,
react-markdown, and pnpm. Tests use Vitest and React Testing Library; ESLint uses
Next.js presets.

```text
Browser → POST /api/chat → server-only OpenAI client → OpenAI → JSON reply → UI
```

Route Handlers keep validation, credentials, and provider calls in one application.
These small backend responsibilities do not justify a separate server or deployment.
Server Components are the default; `ChatConversation` owns the interactive boundary.
Feature-specific components, hooks, types, and storage helpers are colocated in
private folders under `app/chat/`; shared server integration lives in `lib/openai.ts`.
Local React state is sufficient; no global state library is used.

Requests contain ordered user/assistant messages, including restored history and
the newest prompt once. Only completed exchanges persist in LocalStorage; loading
and errors stay in memory. Clear Chat starts a new context.

## Run locally

Use Node.js 22.15+ within Node 22, or Node.js 24+, and pnpm 10.30.3 (pinned in
`package.json`). If pnpm is unavailable on PATH, use `corepack pnpm` instead.

1. Run `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` to your own key.
   The configured model is `gpt-5.5`; your account must have access.
3. Run `pnpm dev` and open [localhost:3000](http://localhost:3000).
   Restart the server after changing environment variables.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm lint` | Lint with zero warnings allowed |
| `pnpm test` | All 14 tests; no real OpenAI calls |
| `pnpm test:watch` | Watch tests |
| `pnpm typecheck` | Generate route types and check TypeScript |
| `pnpm exec tsc --noEmit` | Check TypeScript after route types exist |
| `pnpm build` | Production build; no API key required |
| `pnpm start` | Serve the production build |

## Security and trade-offs

- The key is read only on the server, protected by `server-only`, and never placed
  in public environment variables. `.env.local` is ignored; `.env.example` is blank.
- The API validates roles/content and returns generic provider errors without raw
  exception logging. Assistant Markdown skips raw HTML and uses default URL filtering.
- History is unencrypted in this browser and sent to OpenAI as context. The application
  server does not persist it. Responses use `store: false`, which is not a guarantee
  of zero provider retention.
- Full history is resent, increasing cost and potentially reaching context limits.
  Blocked/full storage falls back to in-memory use. Responses are not streamed.
- Failed prompts are not persisted or restored into the cleared draft. Browser
  cancellation does not guarantee provider cancellation.
- This assessment has no authentication, rate limiting, or request-size budget.
  Public deployment would need abuse/spend controls. Context budgeting and broader
  device coverage are possible future improvements, not implemented features.

Tests mock fetch/OpenAI and cover meaningful behavior. Chromium checks supplement
jsdom for keyboard, layout, and network-state verification. Live-provider answers
and physical-device keyboards were not verified.

See [architecture](docs/ARCHITECTURE.md) for technical decisions and
[development](docs/DEVELOPMENT.md) for phase completion and final validation.

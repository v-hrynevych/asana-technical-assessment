# Architecture

## Phase 1 foundation

Next.js App Router provides routing and the future backend in one application.
`app/layout.tsx`, `app/page.tsx`, and `app/chat/page.tsx` remain Server Components.
The layout uses MUI's `AppRouterCacheProvider` to collect Emotion styles during
streaming. Its library-owned client boundary does not convert page children into
Client Components. No custom theme or application state is introduced.

The integration follows the [MUI App Router guide](https://mui.com/material-ui/integrations/nextjs/).
ESLint runs separately from the production build, as described in the
[Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).

## Directory responsibilities

```text
app/
  layout.tsx                 Root document and MUI cache integration
  globals.css                Minimal global defaults
  page.tsx                   Bootstrap placeholder
  chat/
    page.tsx                 Chat route placeholder
    _components/             Reserved for chat UI
    _hooks/                  Reserved for chat behavior
    _lib/                    Reserved for chat utilities
    _types/                  Reserved for chat types
  api/chat/                  Reserved for the future Route Handler
lib/                         Reserved for shared server infrastructure
tests/
  setup.ts                   DOM matchers and cleanup
  bootstrap.test.tsx         MUI/React rendering infrastructure smoke test
  chat/                      Reserved for chat behavior tests
docs/                        Architecture and implementation status
```

Empty directories contain `.gitkeep` files so Git preserves them. Feature files
such as `ChatInput.tsx`, `useChat.ts`, `storage.ts`, `lib/openai.ts`, and
`app/api/chat/route.ts` are intentionally deferred. Loading and error boundaries
will be added with their corresponding behavior rather than as nonfunctional stubs.

## Planned boundaries (not implemented)

The request flow will be browser → `POST /api/chat` → server-only OpenAI client →
Route Handler → browser. Validation and normalized provider errors belong on the
server; secrets stay in `.env.local` and must never enter client bundles.

Chat state will use a local React hook, without a global state library. Browser
persistence will be isolated in `app/chat/_lib/storage.ts`, and Markdown will be
rendered only for assistant messages. These are later-phase decisions, not current
capabilities. No API calls, persistence, or Markdown rendering exists in Phase 1.

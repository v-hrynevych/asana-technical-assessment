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
    page.tsx                 Server-rendered chat composition
    _components/             Chat layout, header, empty message area, and input
    _hooks/                  Reserved for chat behavior
    _lib/                    Reserved for chat utilities
    _types/                  Reserved for chat types
  api/chat/                  Reserved for the future Route Handler
lib/                         Reserved for shared server infrastructure
tests/
  setup.ts                   DOM matchers and cleanup
  bootstrap.test.tsx         MUI/React rendering infrastructure smoke test
  chat/                      Basic input component tests
docs/                        Architecture and implementation status
```

Empty directories contain `.gitkeep` files so Git preserves them. Feature files
such as `useChat.ts`, `storage.ts`, `lib/openai.ts`, and
`app/api/chat/route.ts` are intentionally deferred. Loading and error boundaries
will be added with their corresponding behavior rather than as nonfunctional stubs.

## Phase 2 UI boundary

`Chat`, `ChatHeader`, `ChatMessages`, and `EmptyState` remain Server Components.
Only `ChatInput` declares an application client boundary for draft input, keyboard
events, and a preview confirmation. Its optional submit callback provides a test
seam; the server page passes no function across the boundary. Submission keeps the
draft and confirms that nothing was sent. The conversation area stays static.
MUI primitives supply responsive styling within the existing cache provider.
No chat hook, request, or message history is introduced.

## Planned boundaries (not implemented)

The request flow will be browser → `POST /api/chat` → server-only OpenAI client →
Route Handler → browser. Validation and normalized provider errors belong on the
server; secrets stay in `.env.local` and must never enter client bundles.

Chat state will use a local React hook, without a global state library. Browser
persistence will be isolated in `app/chat/_lib/storage.ts`, and Markdown will be
rendered only for assistant messages. These are later-phase decisions, not current
capabilities. No API calls, persistence, or Markdown rendering exists in Phase 1.

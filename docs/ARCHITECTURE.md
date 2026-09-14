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
    _types/                  Chat payload and message types
  api/chat/route.ts          POST validation and normalized JSON responses
lib/openai.ts                Server-only OpenAI Responses API call
tests/
  setup.ts                   DOM matchers and cleanup
  bootstrap.test.tsx         MUI/React rendering infrastructure smoke test
  chat/                      Input, mocked API, and request/rendering tests
docs/                        Architecture and implementation status
```

Empty directories contain `.gitkeep` files so Git preserves them. Feature files
such as `useChat.ts` and `storage.ts` are intentionally deferred. Loading and error boundaries
will be added with their corresponding behavior rather than as nonfunctional stubs.

## Phase 3 request flow and boundaries

Browser → `POST /api/chat` → `lib/openai.ts` → OpenAI Responses API →
Route Handler → browser. The route parses JSON as unknown, validates a nonempty
string prompt, trims it, and normalizes success/error payloads. Provider details
are neither returned nor logged. The server helper constructs the SDK client at
request time from `process.env.OPENAI_API_KEY`, so imports/builds need no key.
The `server-only` guard prevents client imports. The installed SDK's
`responses.create` and `output_text` approach follows the
[official text generation guide](https://developers.openai.com/api/docs/guides/text).
The server selects `gpt-5.5`; the browser cannot select a model or supply credentials.
Incomplete or empty text responses become generic failures. `store: false` avoids
requesting response storage for later retrieval; it is not a zero-retention guarantee.

The page, `Chat`, `ChatHeader`, and `EmptyState` remain Server Components.
`ChatConversation` is the interactive client boundary and imports `ChatMessages`
and `ChatInput`. The empty state is passed as rendered children through a prop,
preserving server rendering. Local state holds successful plain-text exchanges,
pending feedback, and a generic error. The draft is retained for retry or editing.
Only `{ prompt }` is sent, so each request is independent of displayed exchanges.
The client validates the success payload before rendering it as escaped React text.
No provider or server-module imports cross into the browser.

## Planned boundaries (not implemented)

Full chat state behavior will use a local React hook, without a global state library. Browser
persistence will be isolated in `app/chat/_lib/storage.ts`, and Markdown will be
rendered only for assistant messages. These are later-phase decisions, not current
capabilities. Application timeout/cancellation, persistence, and Markdown are not
implemented. SDK default request/retry behavior remains unchanged.

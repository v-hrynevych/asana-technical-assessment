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
  page.tsx                   Server redirect to canonical /chat route
  chat/
    page.tsx                 Server-rendered chat composition
    _components/             Chat layout, header, empty message area, and input
    _hooks/useChat.ts         Client request lifecycle and in-memory messages
    _lib/storage.ts          Validated browser history read/save/remove helpers
    _types/                  Chat payload and message types
  api/chat/route.ts          POST validation and normalized JSON responses
lib/openai.ts                Server-only OpenAI Responses API call
tests/
  setup.ts                   DOM matchers and cleanup
  bootstrap.test.tsx         MUI/React rendering infrastructure smoke test
  chat/                      Input, mocked API, and request/rendering tests
docs/                        Architecture and implementation status
```

Empty directories contain `.gitkeep` files so Git preserves them. Loading and error boundaries
will be added with their corresponding behavior rather than as nonfunctional stubs.

## Phase 3 request flow and boundaries

Browser → `POST /api/chat` → `lib/openai.ts` → OpenAI Responses API →
Route Handler → browser. The route parses JSON as unknown and validates a nonempty
`messages` array with `user`/`assistant` roles, non-whitespace string content, and
a final user message. Invalid payloads return HTTP 400. It forwards only role and
content in their original order, preserving Markdown/code whitespace, and normalizes
success/error payloads. Provider details
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
preserving server rendering. `useChat` holds successful exchanges and
request state; `ChatConversation` presents its results. `ChatInput` clears the draft
immediately after valid submission, before the request resolves.
`{ messages: [{ role, content }, ...] }` includes completed exchanges (including
restored history) plus the latest trimmed user prompt exactly once. IDs and transient
state are excluded. The server passes this array as Responses API `input`, following
the [official conversation-state guide](https://developers.openai.com/api/docs/guides/conversation-state).
There are no server sessions or previous-response IDs. Full history is resent;
token cost grows with history and provider context limits can produce a safe error.
The client validates the success payload before rendering user text and assistant Markdown.
No provider or server-module imports cross into the browser.

## Phase 4 client request lifecycle

`useChat` uses a discriminated union for idle, pending, and error states. Entering
pending clears the prior error. A ref locks submission synchronously, including
multiple calls before React rerenders. Empty prompts are rejected in the hook as
well as the input. Success appends the exchange and returns to idle; failures
preserve completed messages and expose only a fixed safe error message.

Submission and request callbacks drive state transitions. Loading and error values
are derived during render, and initial state uses simple constant values. The
request-lifetime effect ties the network request and timer lifetime to the mounted chat:
its unmount handler invalidates the request, aborts fetch, and clears the timer.
It does not initiate requests or orchestrate application state.

`CHAT_REQUEST_TIMEOUT_MS` is 60,000 ms. Each request has an AbortController and
timer covering fetch and JSON body consumption. Timeout aborts the browser request,
releases the submission lock, and displays the timeout message immediately.
Request identity checks ignore late completions so they cannot append stale
messages, replace an error, or unlock a newer request. Completion and unmount
clear timers; unmount invalidates and aborts the active request.

The UI keeps existing messages visible, disables conflicting input actions, and
shows a neutral MUI message-style skeleton with a readable secondary
"Generating response..." polite status. Errors use an alert. The server-only
OpenAI boundary remains intact. Browser abort does not
guarantee cancellation of provider work already running on the server.

The root Server Component uses `redirect("/chat")` from `next/navigation`.
The outer chat application is constrained to the dynamic viewport with responsive
padding inside that height. Container and Paper share a flexible hierarchy with
zero minimum heights. A single scroll area contains history, loading, Clear Chat,
and errors. The three-row composer stays anchored across state transitions and
long drafts without layout effects. Status text remains in normal document flow
inside the constrained scroll area.
Initialization and pending replies share rounded, neutral MUI skeletons with a
slow pulse that is disabled for reduced-motion preferences.

## Phase 5 persistence and Markdown

`storage.ts` owns all production LocalStorage access using `ai-chat.messages.v1`.
It validates message fields and unique IDs, copies only id/role/content, and returns
an empty list for missing, invalid, or inaccessible storage. Writes and removal
fail safely so React state remains usable. Storage failures may prevent persistence
or removal across refresh; no successful disk write is assumed.

The first server and browser render both use an uninitialized (`null`) history
and show "Loading chat history..." with three rounded message skeletons, withholding
the empty state and disabling input.
A mount effect reads
browser storage after hydration; lazy LocalStorage initialization would mismatch
server HTML. Its narrowly documented lint exception permits this external read.
The resulting array marks initialization complete, including when storage is empty or unavailable.
The existing request-lifetime effect still aborts on unmount. There is no effect
watching messages to save them. Success explicitly computes the next list from a
ref, updates React state, and saves it outside React updater functions. Clear Chat
explicitly empties the list, removes the storage key, and resets request errors.
Both the UI and hook prevent reset during an active request. Draft input is retained.
Only completed user/assistant exchanges are saved; transient state is excluded.
There is no cross-tab synchronization or server persistence. Clear Chat also removes
the context used for future requests.

`ChatMessages` uses the installed `react-markdown` for assistant content with
`skipHtml` and its default URL filtering. User content remains escaped plain text.
No raw HTML or plugins are enabled. Code blocks scroll within the message width;
headings, paragraphs, lists, emphasis, inline code, and links use semantic elements.
Author labels use spaced secondary caption typography. Markdown paragraphs, headings,
and lists have explicit spacing; inline code and fenced blocks use neutral backgrounds.
Fenced code preserves whitespace and scrolls horizontally within the message width;
links are underlined. Server/client boundaries remain unchanged.

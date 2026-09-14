# Architecture

## Full-stack approach and colocation

Next.js App Router serves the UI and `POST /api/chat`. Validation, one provider call,
and error normalization fit a Route Handler; a separate backend would add deployment
and integration work without a requirement to justify it. The root Server Component
redirects `/` to the canonical `/chat` route.

Pages, layout, `Chat`, `ChatHeader`, and `EmptyState` are Server Components.
`ChatConversation` is the interactive client boundary, importing input/message
presentation and using `useChat`. The server-rendered empty state passes through a
prop. MUI's AppRouterCacheProvider collects Emotion styles without converting its
child pages to Client Components.

| Location | Responsibility |
| --- | --- |
| `app/chat/page.tsx` | Route composition |
| `app/chat/_components/` | Layout, composer, messages, loading, empty state |
| `app/chat/_hooks/useChat.ts` | Local state and request lifecycle |
| `app/chat/_lib/storage.ts` | Validated LocalStorage access |
| `app/chat/_types/chat.ts` | Message and API payload types |
| `app/api/chat/route.ts` | Request validation and normalized responses |
| `lib/openai.ts` | Server-only OpenAI integration |
| `tests/chat/` | Component, storage, routing, and API tests |

Private route folders keep feature code together without creating routes. No global
component/hook folders or state-management dependencies are needed.

## API and conversation context

```text
Browser → POST /api/chat → lib/openai.ts → OpenAI Responses API → route → browser
```

The request is `{ messages: [{ role, content }, ...] }`; success returns
`{ message: string }`. The client sends completed exchanges in order, including
restored history, followed by the newest trimmed user prompt once. IDs and transient
state are excluded. The route parses JSON as unknown and requires a nonempty array,
`user`/`assistant` roles, non-whitespace string content, and a final user message.
It copies only role/content while preserving code whitespace. Malformed JSON or
payloads return HTTP 400; provider/configuration/unusable-output failures return
HTTP 500 with a safe error payload. Raw exceptions are not logged.

The server helper constructs OpenAI at request time from `OPENAI_API_KEY`, guarded
by `server-only`; builds need no key. It sends the validated array as Responses API
`input`, uses `gpt-5.5` and `store: false`, and returns completed `output_text`.
The browser cannot select a model or supply provider credentials. No server sessions,
previous-response IDs, or server history persistence are used.

Full history makes restored conversations usable as context but increases token
cost and can exceed context limits. There is no truncation, summarization, streaming,
authentication, request-size budget, or rate limiting. These are deliberate assessment
trade-offs rather than a production deployment design.

## State, requests, and persistence

`useChat` owns messages and an idle/pending/error union. A synchronous request ref
blocks duplicates before rerender. Input validation and request callbacks drive
transitions; no effects watch application state to orchestrate requests. The draft
clears immediately on valid submission. Success appends/persists the exchange;
errors preserve completed messages and restore usable controls.

A 60-second AbortController timer covers fetch and body reading. Timeout releases
the UI immediately; identity checks ignore stale completions. Completion clears
the timer, and an unmount effect cancels the external request and timer. Browser
abort does not guarantee cancellation of provider work already running.

History begins as `null`, so server and first client render show initialization
skeletons rather than an empty-state flash. One mount effect reads browser storage
after hydration: lazy browser reads would mismatch server HTML. This narrow external
synchronization has a documented lint exception. There are no layout effects.

`storage.ts` owns `ai-chat.messages.v1`, validates fields and unique IDs, and handles
malformed/inaccessible storage safely. Success and Clear Chat explicitly write/remove
history outside effects and React state updaters. Only id/role/content are persisted.
Clear Chat resets visible history, errors, and future context; it is blocked while
pending. There is no cross-tab synchronization. Storage failures can prevent changes
surviving refresh, but the current chat remains usable in memory.

## Presentation and accessibility

The application fits `100dvh` with responsive padding and a flex hierarchy with
zero minimum heights. One scroll area holds messages, errors, and Clear Chat. The
header and three-row composer stay within the panel; long drafts or skeletons do
not grow the document. Short landscape screens use smaller outer spacing.

Initialization shows "Loading chat history..." with three rounded MUI skeletons.
Pending requests show "Generating response..." with an assistant-style skeleton
after existing messages. Secondary text and polite status semantics explain each
state. Decorative skeletons are hidden from assistive technology and their pulse
respects reduced-motion preferences. Errors use an alert.

The labeled form supports Enter to submit, Shift + Enter for newlines, and IME
composition. Main/header/section/article/form elements provide structure. Author
labels use secondary captions separated from the message body.

Assistant messages use react-markdown with `skipHtml` and default URL filtering;
user messages remain plain text. Headings, paragraphs, lists, emphasis, and links
use semantic markup. Inline code has a neutral background; fenced blocks preserve
whitespace and scroll horizontally within the message width. There is no raw HTML
injection, syntax-highlighting dependency, or Markdown plugin layer.

## Test strategy

Vitest and React Testing Library cover input, loading/duplicate protection,
failure/timeout recovery, persistence/reset, hydration, Markdown, root routing,
and the messages-based API contract. Route tests exercise the server helper with
the OpenAI SDK mocked; component tests mock fetch. Tests isolate LocalStorage,
timers, and environment variables and never call the real provider.

Production-build Chromium checks supplement jsdom with keyboard events, viewport
measurements, and mocked network responses. Live-provider output, physical-device
keyboards, and exhaustive cross-browser coverage are outside recorded verification.
See [development](DEVELOPMENT.md) for final results.

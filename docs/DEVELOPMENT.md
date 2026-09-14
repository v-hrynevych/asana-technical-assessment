# Development and submission record

## Completed phases

| Phase | Status | Outcome |
| --- | --- | --- |
| 0 — Planning | Complete | Assessment scope, required stack, security rules, and route-level colocation defined |
| 1 — Project Bootstrap | Complete | Next.js, strict TypeScript, pnpm, MUI, SDK, Markdown, lint, and test infrastructure |
| 2 — Static Chat UI | Complete | Responsive semantic layout, labeled composer, empty state, and keyboard submission |
| 3 — AI Integration | Complete | Server-only OpenAI client, Route Handler validation, and dynamic responses |
| 4 — Application State | Complete | Loading/errors, duplicate prevention, timeout, and stale-response protection |
| 5 — Bonus Features | Complete | LocalStorage persistence, restoration, Clear Chat, and assistant Markdown |
| 6 — Focused Testing | Complete | Small behavior-focused suite using mocked providers and isolated browser state |
| 7 — Final Quality Review | Complete | Stable viewport layout, skeleton statuses, conversation context, Markdown styling, and root redirect |
| 8 — Submission Preparation | Complete | Reviewer documentation, requirement mapping, repository/secret review, and final validation |

Completion covers the implementation and submission-preparation scope. Verification
limits are recorded below; deployment, a live-provider demonstration, and committing
or publishing the repository were not part of this task.

## Development decisions

Implementation proceeded incrementally through the agreed phases. Next.js Route
Handlers kept the small backend in the same application. Server Components remain
the default, while feature-specific behavior stays under `app/chat/`. MUI provides
the UI; React state and a custom hook avoid unnecessary state-management dependencies.

The final API uses ordered user/assistant messages, including restored history and
the latest prompt once. The server validates the conversation and forwards only
role/content to OpenAI. No sessions, streaming, database, or provider error details
are exposed. Full history is resent, with context-window/cost trade-offs documented
in the README and architecture document.

History initializes after hydration through a narrow browser-storage effect;
request/timer cleanup uses a separate lifecycle effect. Submission, error transitions,
and persistence writes happen in explicit actions. The input clears when submission
is accepted. Timeouts and failures preserve completed exchanges and release controls.

Phase 7 established the final presentation: a viewport-constrained panel with one
message scroll area, a stable three-row composer, server redirect from `/` to `/chat`,
readable status text alongside neutral rounded skeletons, separate author captions,
and semantic Markdown with horizontally scrolling fenced code. The empty state is
withheld until history restoration finishes. Clear Chat removes saved and visible
history and the context for future requests.

Phase 8 consolidated documentation around this final behavior and removed seven
redundant `.gitkeep` files from populated directories. It also corrected the empty
state's inaccurate claim that prior messages were not sent to AI. This was a
privacy-relevant copy correction; no application logic or dependencies changed.

## Final validation

Validation on 2026-09-14 used `corepack pnpm`, the available pnpm launcher.

| Command | Result |
| --- | --- |
| `pnpm lint` | Passed; zero warnings |
| `pnpm test` | Passed; **14 tests across 7 files** |
| `pnpm build` | Passed; static UI routes and dynamic `/api/chat` |
| `pnpm exec tsc --noEmit` | Passed |
| `git status`, `git diff`, `git diff --cached` | Reviewed; submission changes remain unstaged and uncommitted |
| `git diff --check` | Passed |

Tests cover validation, input clearing and keyboard behavior, successful requests,
duplicate prevention, failure/timeout recovery, storage/reset, hydration, Markdown,
root routing, and ordered conversation context. Component tests mock fetch; route
tests mock the OpenAI SDK. No automated check calls the real provider. Test subprocesses
require execution outside this environment's sandbox because of its EPERM restriction.

## Browser checklist

Production-build checks use headless Chromium at 1440×900, 768×1024, 375×667,
320×568, and 667×375 with mocked responses. Earlier desktop/mobile screenshots
were also reviewed for author labels and Markdown spacing.

| Behavior | Verification |
| --- | --- |
| `/` opens `/chat` | Browser navigation and root unit test |
| Input, Enter, Shift + Enter, immediate clearing | Browser keyboard events and component tests |
| Dynamic replies and prior context | Mocked browser requests plus route/SDK contract assertions |
| Refresh, skeleton initialization, no empty-state flash | Server-rendered loading check, browser restoration, hydration test |
| Informative request skeleton; earlier messages retained | Browser and component checks |
| Clear Chat | Browser verifies empty UI and removed LocalStorage key |
| Markdown and wide fenced code | Semantic component test and browser horizontal-overflow checks |
| API/network errors | Safe route errors, component tests, browser mocked network failure |
| Request timeout | Fake-timer unit test and browser full 60-second timeout/abort check |
| Long history, anchored composer, mobile/desktop usability | Browser measurements with 30 stored messages; one message scrollbar and no page growth |

The browser checks exercise actual DOM rendering and keyboard events, but they are
not a physical-device or exhaustive cross-browser accessibility audit. Actual
OpenAI answers, live conversation memory, and on-screen mobile keyboards were not
verified. Context delivery is verified independently at the browser request and
mocked SDK boundaries.

## Repository and security review

- `.env.example` is tracked and contains only `OPENAI_API_KEY=`. `.env.local` is
  ignored; no public key variable is used.
- Tracked source/documentation and 99 reachable history blobs were scanned for
  common credential signatures and the configured local key without printing it.
  No matches were found. This is a focused check, not a guarantee against every
  possible secret format.
- Dependencies, build output, coverage, environment files, and local agent state
  are not tracked. Nothing is staged. Temporary browser/audit artifacts stay in
  ignored build output and are not submission files.
- The current local strategy excludes `AGENTS.md` through `.git/info/exclude`.
  Phase 8 explicitly preserves that strategy; the local instruction file and Git
  exclusion settings were not changed.
- Imports, comments, debug logging, file usage, and dependencies were reviewed.
  No unused product code or unnecessary dependencies were found. Emotion packages
  are required by MUI/its Next.js integration; test peer dependencies are intentional.

## Remaining limitations and tooling notes

The application is an interview assessment, not a hardened public service. It has
no authentication, rate limiting, request-size cap, context budgeting, streaming,
or server-side history persistence. Storage is browser-local and may be blocked or
full. Failed drafts are cleared, and browser abort does not guarantee provider
cancellation. These trade-offs and future improvements are summarized in README.

Existing installation notes remain: ESLint 9 and transitive `whatwg-encoding` have
reported deprecations; jsdom is retained for Node 22.15 compatibility; pnpm previously
skipped the `unrs-resolver` build script. Current lint, tests, typecheck, and build
pass. No dependency upgrade or blanket build-script approval was introduced.

Recommended final commit: `docs: prepare technical assessment submission`.

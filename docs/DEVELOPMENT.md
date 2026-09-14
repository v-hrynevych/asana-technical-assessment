# Development

## Phase status

| Phase | Status |
| --- | --- |
| 0 — Planning | Requirements and architecture defined in root AGENTS.md |
| 1 — Project Bootstrap | Complete; required checks passed |
| 2 — Static Chat UI | Complete; required checks passed |
| 3 — AI Integration | Not started |
| 4 — Application State | Not started |
| 5 — Bonus Features | Not started |
| 6 — Testing | Not started; infrastructure and basic input tests exist from Phases 1–2 |
| 7 — Final Quality Review | Not started |
| 8 — Submission | Not started |

## Phase 1 scope and decisions

- Added Next.js App Router, strict TypeScript, and a pinned pnpm package manager.
- Added Material UI, Emotion's styling dependencies, and MUI's Next.js adapter
  for streaming-compatible style collection. Pages and layout remain Server Components.
- Installed OpenAI SDK and react-markdown for later implementation only.
- Configured ESLint and Vitest with jsdom, React Testing Library, DOM matchers,
  automatic cleanup, and matching `@/` import aliases.
- Reserved route-level private feature folders, the future API/server directories,
  and `tests/chat` using `.gitkeep` files. Only minimal route placeholders exist.
- Added a blank server-only API key example; no real credentials are required.
- Preserved existing user changes and root `AGENTS.md` content. Added an
  `!AGENTS.md` ignore exception because a local `.git/info/exclude` rule hid it.
  The instructions file is now eligible for tracking with the bootstrap files.

## Tooling issues and validation

The environment has Node.js 22.15.0 but no `pnpm` executable on PATH. Corepack's
default pnpm download failed to launch; explicitly selecting pnpm 10.30.3 worked.
Commands use `corepack pnpm` as the equivalent pnpm launcher in this environment.
Registry access required sandbox escalation.

Validation on 2026-09-13, using the `corepack pnpm` launcher:

| Command | Result |
| --- | --- |
| `pnpm lint` | Passed with zero lint warnings |
| `pnpm test` | Passed: 1 infrastructure test in 1 file |
| `pnpm build` | Passed, including TypeScript and static generation of `/` and `/chat` |
| `pnpm typecheck` | Passed (`next typegen` and `tsc --noEmit`) |
| `git status` | Reviewed; bootstrap files are uncommitted |
| `git diff` / `git diff --check` | Reviewed; no whitespace errors |

The sandbox initially blocked Vitest startup and the build's TypeScript worker
with `spawn EPERM`. Both commands passed when rerun with approved escalation.

Remaining installation warnings:

- ESLint 9.39.5 is deprecated. ESLint 10 was checked but produced incompatible
  peer ranges in Next.js's bundled import, accessibility, and React plugins, so
  ESLint 9 is retained until those plugins support the newer major.
- jsdom 26 supports the installed Node.js 22.15.0; the latest jsdom requires a
  newer Node release. Its transitive `whatwg-encoding@3.1.1` is deprecated.
- pnpm skipped the `unrs-resolver` build script. The installed native package
  works for the current environment and lint passes; no blanket script approval
  was added.

Phase 1 ends here. No chat UI, API request flow, LocalStorage, or Markdown
rendering has been implemented. Phase 2 requires a separate task.

## Phase 2 — Static Chat UI

Implemented `/chat` with a responsive MUI container, header, static conversation
region, empty state, labeled multiline input, and Send button. Mobile controls
stack vertically; tablet and desktop controls share a row inside a bounded
container. Content can grow vertically without a fixed-height clipping region.

The page and presentation components remain Server Components. Only `ChatInput`
uses a client boundary for draft text and a preview-only submission confirmation.
It retains the draft and does not append messages or call any service. Empty and
whitespace-only prompts are rejected. Enter submits, Shift + Enter preserves
native newline behavior, and IME composition does not trigger submission.
Semantic main/header/section/form elements, a visible input label, keyboard help,
a named button, heading hierarchy, and a polite status announcement support
keyboard and screen-reader use.

Files added:

- `app/chat/_components/Chat.tsx`
- `app/chat/_components/ChatHeader.tsx`
- `app/chat/_components/ChatMessages.tsx`
- `app/chat/_components/EmptyState.tsx`
- `app/chat/_components/ChatInput.tsx`
- `tests/chat/ChatInput.test.tsx`

Files modified: `app/chat/page.tsx`, `README.md`, `docs/ARCHITECTURE.md`, and
`docs/DEVELOPMENT.md`. No files deleted or dependencies added.

Validation on 2026-09-13, using `corepack pnpm`:

| Command | Result |
| --- | --- |
| `pnpm lint` | Passed; zero warnings |
| `pnpm test` | Passed; 5 tests across 2 files, including 4 Phase 2 input tests |
| `pnpm build` | Passed; `/chat` statically prerendered |
| `pnpm exec tsc --noEmit` | Passed |
| `git status` / `git diff` / `git diff --check` | Reviewed; no whitespace errors |

The sandbox blocked test/build subprocesses with `spawn EPERM`; approved retries
ran successfully. The initial type check caught an unsupported MUI `alignItems`
prop on Stack; moving it into `sx` fixed the issue, and all checks were rerun.
No new validation warnings remain. Existing dependency warnings recorded under
Phase 1 are unchanged. Responsive styles were reviewed in source; manual browser
verification on mobile, tablet, and desktop remains outstanding. The Shift + Enter
test checks that the event is not prevented and multiline values are retained;
jsdom does not emulate native textarea newline insertion.

Phase 2 ends here. Phases 3–8 remain unimplemented; no API integration, fetch,
chat business hook, persistence, Markdown, request state, or timeout was added.

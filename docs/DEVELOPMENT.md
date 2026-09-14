# Development

## Phase status

| Phase | Status |
| --- | --- |
| 0 — Planning | Requirements and architecture defined in root AGENTS.md |
| 1 — Project Bootstrap | Complete; required checks passed |
| 2 — Static Chat UI | Not started |
| 3 — AI Integration | Not started |
| 4 — Application State | Not started |
| 5 — Bonus Features | Not started |
| 6 — Testing | Not started; infrastructure smoke test only in Phase 1 |
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

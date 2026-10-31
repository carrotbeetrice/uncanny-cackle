# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Frontend take-home ("Meridian Banking"): a single-page React 19 + TypeScript + Vite app with a dashboard and a three-step transfer dialog, backed entirely by an MSW mock API. `src/App.tsx` is a placeholder to be replaced.

The spec lives in `brief/`. Read it before building features — it fixes exact UI copy, validation messages, and requirement IDs (D1–D8, T1–T8, TH1–TH3, E1–E6) that the README should reference:
- `brief/candidate-brief.md` — requirements, required copy (§4), layout/breakpoints (§5)
- `brief/api-contract.md` — endpoints, error shapes, test/demo hooks
- `wireframes/wireframe.md` — screen layouts and required states per area
- `DEPLOYMENT.md` — hosting and MSW-in-production troubleshooting

The candidate must be able to explain and live-edit all code without AI, so prefer small, readable code over clever abstractions.

## Commands

Node 22 (`.nvmrc`).

```bash
npm run dev                         # http://localhost:5173 (MSW serves /api)
npm test                            # vitest run
npm run test:watch
npx vitest run src/lib/format.test.ts        # single file
npx vitest run -t "reaches the mock API"     # single test by name
npm run lint
npm run typecheck                   # tsc (noEmit)
npm run check                       # lint + typecheck + tests — must pass
npm run build                       # tsc && vite build — must pass
npm run mock                        # optional Node mock server on :4010 for curl
```

## Architecture

**Mock API (do not edit).** `mock-api/handlers.ts` + `mock-api/db.json` are the single source of truth, re-exported by `src/mocks/handlers.ts`. They run in three places: the browser worker (`src/mocks/browser.ts`, started in `src/main.tsx` before render, including in production), Vitest (`src/test/setup.ts` via `msw/node`), and `mock-api/server.mjs`. State is in-memory; a page reload or `resetMockDb()` (called before every test) restores the seed. Never change mock data or handlers to make something pass — override per-test with `server.use(...)` (import `server` from `src/test/setup.ts`).

**API layer.** All requests go through `apiFetch<T>` in `src/api/client.ts`, which prefixes `import.meta.env.BASE_URL` and throws `ApiError` (`status`, `code`, `fields`, `meta`) on non-2xx. Types are in `src/api/types.ts`. Components must not call `fetch` directly. Server-side validation errors arrive as `fields` keyed like `amount`, `recipient.accountNumber` — show those under the field and `message` in a `role="alert"`.

**Server state.** TanStack Query; the `QueryClient` is created in `src/main.tsx` (`staleTime: 30s`, `retry: 1`). Don't copy API data into `useState`/stores or derive-and-store totals; don't fetch in `useEffect`. After `POST /api/transfers`, customer, accounts and transactions must refresh (invalidate or update cache). Tests should create their own `QueryClient` with `retry: false` (see `src/App.test.tsx`).

**Forms.** React Hook Form + Zod; each validation rule defined once and used for both inline and submit validation (brief §3.3). Balance/daily-limit rules depend on fetched data, so the schema needs that context.

**Theming.** `brief/design-tokens.css` (imported by `src/index.css`) keys everything off `data-theme` (`light`/`dark`) and `data-segment` (`retail`/`premium`) on `<html>`. Use only its CSS variables — no hard-coded colours in components. Theme choice must be applied before first paint (inline script in `index.html` reading `localStorage`) to avoid a flash.

## Conventions and gotchas

- Use `formatMoney` / `formatShortDate` from `src/lib/format.ts`. `Intl` inserts a non-breaking space after `SGD`, so in tests assert against `formatMoney(...)`, never a typed string.
- Tests run with `TZ=Asia/Singapore` in jsdom; `onUnhandledRequest: 'error'` means any un-mocked request fails the test.
- Mock responses take ~500 ms; use `waitFor`/`findBy*` in tests.
- Demo hooks: `?scenario=error|empty`, `?delay=ms` on GETs; a transfer note containing `#fail` returns 500. Use only for debug/demo UI, not normal logic.
- Transfers are not idempotent — the confirm button must be disabled while sending.
- TypeScript is strict with `noUnusedLocals`/`noUnusedParameters`; ESLint errors on `any`.
- Required minimum tests (E4): over-balance amount shows error and sends no request; successful transfer shows success and dashboard updates; failed dashboard load shows error and `Retry` recovers.

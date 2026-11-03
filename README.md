# Meridian Banking — Caryl Peneyra

- Deployed: [https://fabulous-jalebi-b8c17d.netlify.app/](https://fabulous-jalebi-b8c17d.netlify.app/)
- Run locally: `npm install && npm run dev`

## Project structure

```tree
src
├── api // apiFetch wrapper, ApiError and API response types
│   ├── client.ts
│   └── types.ts
├── App.test.tsx
├── App.tsx
├── components // Components used in app
│   ├── DashboardSkeleton // Dashboard loading state comprised of Skeleton components
│   │   ├── DashboardSkeleton.css
│   │   └── DashboardSkeleton.tsx
│   ├── Header // Logo, nav, toggles and avatar
│   │   ├── Header.css
│   │   ├── Header.test.tsx
│   │   ├── Header.tsx
│   │   ├── SegmentSwitch // Retail/Premium (brand colour) toggle
│   │   │   ├── SegmentSwitch.css
│   │   │   ├── SegmentSwitch.test.tsx
│   │   │   └── SegmentSwitch.tsx
│   │   └── ThemeToggle // Light/dark toggle
│   │       ├── ThemeToggle.css
│   │       ├── ThemeToggle.test.tsx
│   │       └── ThemeToggle.tsx
│   ├── RetryState // Retry button for failed dashboard queries
│   │   ├── RetryState.css
│   │   └── RetryState.tsx
│   ├── Skeleton // Skeletons for loading state
│   │   ├── Skeleton.css
│   │   └── Skeleton.tsx
│   └── TransactionList // Display for transactions list and search filter
│       ├── Search // Custom search filter with debounce
│       │   ├── Search.css
│       │   ├── Search.test.tsx
│       │   └── Search.tsx
│       ├── Transaction // Individual component for displaying each transaction row
│       │   ├── Transaction.css
│       │   ├── Transaction.test.tsx
│       │   └── Transaction.tsx
│       ├── TransactionList.css
│       ├── TransactionList.test.tsx
│       └── TransactionList.tsx
├── hooks // Custom hooks, e.g. for handling queries
│   └── useCustomerDataQuery.ts
├── index.css
├── lib // Money and date formatting
│   ├── format.test.ts
│   └── format.ts
├── main.tsx
├── mocks // MSW browser worker; re-exports the mock API handlers
│   ├── browser.ts
│   └── handlers.ts
├── test // Vitest setup and MSW server
│   └── setup.ts
├── theme // Theme and segment context providers
│   ├── SegmentContext.tsx
│   └── ThemeContext.tsx
└── vite-env.d.ts
```

All component tests and styles are colocated with each component file.

## Decisions and trade-offs

- **Server state vs UI state (E2):**
  - API data lives only in the TanStack Query cache (`staleTime` 30 s, `retry: 1`); components read it through `useCustomerDataQuery` and never copy it into `useState`. Derived values, like the filtered transaction list, are computed on render, not stored.
  - UI-only state stays local: `TransactionList` holds the search text and its debounced value in `useState`.
  - Theme and segment are app-wide UI state, so they live in React Context (`ThemeProvider`, `SegmentProvider`) and are saved to `localStorage`.
- **Theme (TH1):** An inline script in `index.html` sets `data-theme` (saved choice, else system setting) and `data-segment` (saved choice, else retail) before first paint, so there is no flash. `ThemeProvider` starts from that value and exposes `useTheme()` for components that need the theme in JS; everything else styles off the tokens.
- **Loading (D1):**
  - `useCustomerDataQuery` fetches customer, accounts and transactions in parallel. It is loading until all 3 succeed and errors if any fails; `retry` refetches only the failed queries.
  - `Skeleton` takes named sizes (BEM modifiers) instead of rem values.
- **Segment (TH2):** The brief doesn't name a control type. The switch is a Headless UI `RadioGroup`, not a `Switch`: Retail and Premium are two named options and neither is "off". A `Switch` would announce Retail as "Premium, off", while a radio group matches the visible two-option pill and would take a third segment.
  - The API's `segment` is the default and a saved choice overrides it. `SegmentProvider` lives in `App` to receive that default.
  - Trade-off: a premium customer with no saved choice sees retail colours for about 500 ms until `/api/customer` responds. Blocking the render would break the D1 skeleton. Possible fix: cache the last API segment in `localStorage` for the `index.html` script.
- **Search (D6):**
  - The brief only asks for "a way to clear the search". The `Clear search` button sits beside the result count while there are matches, and under the `No transactions match your search.` label when there are none, so only one shows at a time.
  - `TransactionList` holds the input text (`query`) and the debounced value (`searchTerm`, 300 ms). `Search` runs the timer in a `useEffect`, so new keystrokes cancel a pending search.
  - The brief doesn't say whether older transactions should be searchable; `brief/api-contract.md` allows filtering "the 8 loaded rows" or using `q`. Chose to filter the 8 loaded rows: no extra requests, and it matches what's on screen. Trade-off: older transactions can't be found; switching to `q` would fix that.
- **Accessibility (TH3):** Interactive controls use `@headlessui/react`, which supplies the ARIA roles, state and keyboard handling while leaving styling to the tokens.
  - `ThemeToggle` is a `Switch` (`role="switch"`, `aria-checked`); `SegmentSwitch` is a `RadioGroup` (`role="radiogroup"` with `role="radio"` options, `aria-checked`, arrow keys move between options). Both have accessible names.
  - Focus rings are styled on Headless UI's `data-focus` attribute, which is set only for keyboard focus, like `:focus-visible`.
  - The theme `Switch` follows the WAI-ARIA switch pattern: Space toggles it, Enter doesn't. The brief doesn't specify a key, so this is the library default.
  - Trade-off: an extra dependency, and the toggles' accessible contract changed from `button` + `aria-pressed` to `switch`/`radio` + `aria-checked`, so their spec tests were updated to match.
  - Text contrast has not been fully checked against WCAG AA across the four theme and segment combinations (light/dark × retail/premium).

## Loading, empty and error states

- **Loading (D1):** While any of the 3 queries is loading, `DashboardSkeleton` replaces the page. It copies the dashboard layout (greeting, total, 3 account cards, 8 transaction rows), so nothing jumps when the data arrives. It's a `role="status"` with `aria-busy` and the hidden text "Loading your dashboard…". It also shows again after `Retry`.
  - To see it: reload the deployed app.
- **Error (D7):** If any query fails, `RetryState` shows `We couldn't load your dashboard.` in a `role="alert"` with a `Retry` button. `Retry` refetches only the queries that failed.
  - To see it: run `src/App.test.tsx`, which fails the first `/api/customer` request. The deployed app has no debug menu to add `?scenario=error` to the requests, so the state can't be triggered there.
- **Empty search (D6):** When a search has no matches, the list shows `No transactions match your search.` with a `Clear search` button, which restores the list.
  - To see it: type something that does not match any displayed description or category (e.g. `zzz`) into `Search transactions`.

## Tests

Component tests are spec tests against the brief: each file opens with a comment naming the requirement it checks, and some also spell out the component's contract.

| Test File                                          | Requirements | What it covers and why                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.test.tsx`                                 | D7, TH2, E4  | Loads the page through the real mock handlers and starts on the customer's segment, then fails only the first `/api/customer` request (`server.use(..., { once: true })`) and checks `Retry` recovers. **Why:** E4 minimum, and the only test that runs the real handlers, TanStack Query and `useCustomerDataQuery` together; failing once proves `Retry` refetches rather than re-renders. |
| `Header/Header.test.tsx`                           | D2           | Logo, initials avatar, disabled Cards/Payments/Insights and both toggles, each checked on its own, plus no greeting while loading. **Why:** the header renders before the customer loads, so each D2 item needs checking in both states.                                                                                                                                                     |
| `Header/ThemeToggle/ThemeToggle.test.tsx`          | TH1, TH3     | Accessible label on a `switch` with `aria-checked`, `data-theme` on `<html>` and back, `localStorage`, starting from the theme set before first paint, and toggling with Space. **Why:** TH1 can fail silently three ways: a flash of the wrong theme, a choice that isn't remembered, and a toggle keyboard users can't reach (TH3).                                                        |
| `Header/SegmentSwitch/SegmentSwitch.test.tsx`      | TH2, TH3     | `Retail`/`Premium` `radio`s with `aria-checked`, switching `data-segment` without changing the theme, saving the choice, and a saved choice beating the API default. **Why:** three sources set the segment (saved, API, retail fallback); wrong precedence is easy to miss by hand because it only shows for premium customers.                                                             |
| `TransactionList/Transaction/Transaction.test.tsx` | D5           | Description, category and short date, `-`/`+` prefixes, the `Pending` chip only when pending, and amounts compared with `formatMoney(...)`. **Why:** money display is where a wrong sign or format misleads the user; `formatMoney` avoids false failures from `Intl`'s non-breaking space after `SGD`.                                                                                      |
| `TransactionList/TransactionList.test.tsx`         | D5, D6       | Only the 8 newest in order, search by description or category ignoring case with the result count, and the no-matches message with `Clear search` restoring the list. **Why:** checks D5/D6 through the real 300 ms debounce with `findBy*`, as a user sees it, so it catches wiring bugs between `Search` and the list.                                                                     |
| `TransactionList/Search/Search.test.tsx`           | D6           | Label and placeholder, `onChange` per keystroke, `onSearch` only after the delay, a new value restarting the timer, and unmount dropping a pending search. **Why:** timing bugs (searching every keystroke, a stale search firing after clear) are hard to see in the integration test; fake timers with the exported `delay` make them deterministic.                                       |

E4 minimums: the failed-load-and-Retry test is done. The other two (an over-balance amount shows the error and sends no request; a successful transfer shows success and the dashboard updates) need the transfer dialog, which isn't built yet.

## AI use

What I used Claude Code for:

- CI/CD files setup
- Commit message generation
- Generating `css` styles for components
- Spec tests for components
- `ThemeProvider` and `SegmentSwitch` contexts
- Transaction search (`Search` debounce, filtering, tests)
- Refactoring toggles, buttons and the search input to Headless UI components

Three places where I changed, rejected or fixed what the AI produced:

- Claude Code's initial suggested implementation for the `Skeleton` component was

  ```tsx
  // Requires callers to directly pass CSS variables and/or rem values
  interface SkeletonProps {
    width?: string;
    height?: string;
    radius?: string;
  }

  // Skeleton implementation omitted
  ```

  Changed it to named sizes via BEM class modifiers, so skeletons stick to the design scale instead of taking arbitrary values.

- Claude Code insisted `DashboardSkeleton` isn't shown during retry. Added assertions to `App.test.tsx` that check for it; they pass, showing Claude Code was wrong.
- Claude Code presented searching the whole transaction history as a requirement; the brief doesn't say that. Reverted to the contract's option of filtering the 8 loaded rows, and recorded the ambiguity under Decisions.

## Not done / known issues

Not done: `D3`, `D4`, `D8`, `T1–T8`, `E3`, `E4` (partially implemented, only failed-load-and-Retry test is done)

Known issues:

- No empty transaction list state. If `/api/transactions` returns no rows, the section shows only its heading and search box. The brief lists "empty states" as required but only defines no search matches for transactions (`wireframes/wireframe.md` §7), so the copy and design are unspecified.
- A failed background refetch hides loaded data. TanStack Query refetches stale queries when the tab regains focus. If that refetch fails, `useCustomerDataQuery` reports `isError` even though the old data is still cached, so `RetryState` replaces a working dashboard. Fix: report an error only when a query fails and has no data.
- In-app browsers (e.g. opening the link from Slack or LinkedIn on iOS) and Safari private mode restrict service workers, so the mock API can't start. `main.tsx` still renders after its 2.5 s timeout, however `/api/*` requests get a 404 from Netlify, and the dashboard shows its error state. `Retry` can't recover; open the link in a normal browser window instead.
- Disabled nav items (Cards, Payments, Insights) fall short of WCAG AA contrast in light mode: `--text-subtle` on `--bg` is 4.28:1, below the 4.5:1 minimum. WCAG exempts disabled controls, but switching them to `--text-muted` (6.41:1) would avoid relying on the exemption.

Potential areas of improvement:

- Use a custom debounce hook for the `Search` component. Either define one within the app or use an existing React library, e.g. [use-debounce](https://www.npmjs.com/package/use-debounce)

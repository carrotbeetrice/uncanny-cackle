# Meridian Banking — Caryl Peneyra

- Deployed: `https://fabulous-jalebi-b8c17d.netlify.app/`
- Run locally: `npm install && npm run dev`

## Project structure

```tree
src
├── api
│   ├── client.ts
│   └── types.ts
├── App.test.tsx
├── App.tsx
├── components
│   ├── DashboardSkeleton
│   │   ├── DashboardSkeleton.css
│   │   └── DashboardSkeleton.tsx
│   ├── Header
│   │   ├── Header.css
│   │   ├── Header.test.tsx
│   │   ├── Header.tsx
│   │   ├── SegmentSwitch
│   │   │   ├── SegmentSwitch.css
│   │   │   ├── SegmentSwitch.test.tsx
│   │   │   └── SegmentSwitch.tsx
│   │   └── ThemeToggle
│   │       ├── ThemeToggle.css
│   │       ├── ThemeToggle.test.tsx
│   │       └── ThemeToggle.tsx
│   ├── RetryState
│   │   ├── RetryState.css
│   │   └── RetryState.tsx
│   ├── Skeleton
│   │   ├── Skeleton.css
│   │   └── Skeleton.tsx
│   └── TransactionList
│       ├── Search
│       │   ├── Search.css
│       │   ├── Search.test.tsx
│       │   └── Search.tsx
│       ├── Transaction
│       │   ├── Transaction.css
│       │   ├── Transaction.test.tsx
│       │   └── Transaction.tsx
│       ├── TransactionList.css
│       ├── TransactionList.test.tsx
│       └── TransactionList.tsx
├── hooks
│   └── useCustomerDataQuery.ts
├── index.css
├── lib
│   ├── format.test.ts
│   └── format.ts
├── main.tsx
├── mocks
│   ├── browser.ts
│   └── handlers.ts
├── test
│   └── setup.ts
├── theme
│   ├── SegmentContext.tsx
│   └── ThemeContext.tsx
└── vite-env.d.ts
```

## Decisions and trade-offs

- **Theme (TH1):** An inline script in `index.html` sets `data-theme` (saved choice, else system setting) before first paint, so there is no flash. `ThemeProvider` starts from that value and exposes `useTheme()` for components that need the theme in JS; everything else styles off the tokens.
- **Loading (D1):**
  - `useCustomerDataQuery` fetches customer, accounts and transactions in parallel. It's loading until all 3 succeed and errors if any fails; `retry` refetches only the failed queries.
  - `Skeleton` takes named sizes (BEM modifiers) instead of rem values.
- **Segment (TH2):** The brief doesn't explicitly name a control type to use, so the switch is implemented with a Headless UI `RadioGroup`
  - The API's `segment` is the default and a saved choice overrides it. `SegmentProvider` lives in `App` to receive that default.
  - Trade-off: a premium customer with no saved choice sees retail colours for about 500 ms until `/api/customer` responds. Blocking the render would break the D1 skeleton. Possible fix: cache the last API segment in `localStorage` for the `index.html` script.
- **Search (D6):**
  - The brief only asks for "a way to clear the search". The `Clear search` button sits beside the result count while there are matches, and under the `No transactions match your search.` label when there are none, so only one shows at a time.
  - `TransactionList` holds the input text (`query`) and the debounced value (`searchTerm`, 300 ms). `Search` runs the timer in a `useEffect`, so new keystrokes cancel a pending search.
  - The brief doesn't say whether older transactions should be searchable; `brief/api-contract.md` allows filtering "the 8 loaded rows" or using `q`. Chose to filter the 8 loaded rows: no extra requests, and it matches what's on screen. Trade-off: older transactions can't be found; switching to `q` would fix that.
- **Accessibility (TH3):** The `@headlessui/react` library simplifies implementation by having accessibility built into their components

## Loading, empty and error states

- **Loading (D1):** While any of the 3 queries is loading, `DashboardSkeleton` replaces the page. It copies the dashboard layout (greeting, total, 3 account cards, 8 transaction rows), so nothing jumps when the data arrives. It's a `role="status"` with `aria-busy` and the hidden text "Loading your dashboard…". It also shows again after `Retry`.
  - To see it: reload the deployed app
- **Error (D7):** If any query fails, `RetryState` shows `We couldn't load your dashboard.` in a `role="alert"` with a `Retry` button. `Retry` refetches only the queries that failed.
  - To see it: run `src/App.test.tsx`, which fails the first `/api/customer` request. The deployed app has no debug menu to add `?scenario=error` to the requests, so the state can't be triggered there.
- **Empty search (D6):** When a search has no matches, the list shows `No transactions match your search.` with a `Clear search` button, which restores the list.
  - To see it: type something that does not match any displayed description or category (e.g. `zzz`) into `Search transactions`.
- **Empty transaction list:** Not handled. If `/api/transactions` returns no rows (`?scenario=empty`), the section shows only its heading and search box, with no message.

## Tests

Component tests are spec tests against the brief: each file opens with a comment naming the requirement it checks, and some also spell out the component's contract.

| Test File                                          | Requirements | Tests Behaviour | Tests Implementation | What it tests                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------- | ------------ | --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/App.test.tsx`                                 | D7, TH2, E4  | ✓               |                      | Integration tests through the real handlers. The page loads from the mock API and starts on the customer's segment. A failed load shows `We couldn't load your dashboard.` and `Retry` recovers. This error case is an E4 minimum: it fails only the first `/api/customer` request with `server.use(..., { once: true })`, so `Retry` hits the real handler. |
| `Header/Header.test.tsx`                           | D2           | ✓               |                      | Logo, initials avatar, no greeting while loading, disabled Cards/Payments/Insights, and both toggles present. Each D2 item is checked on its own, including the loading state.                                                                                                                                                                               |
| `Header/ThemeToggle/ThemeToggle.test.tsx`          | TH1, TH3     | ✓               | ✓                    | Accessible label and `aria-pressed`, switching `data-theme` and back, saving to `localStorage`, starting from the theme set before first paint, and keyboard use.                                                                                                                                                                                            |
| `Header/SegmentSwitch/SegmentSwitch.test.tsx`      | TH2, TH3     | ✓               | ✓                    | Defaults to the customer's segment, switches `data-segment` without changing the theme, and saves the choice. A saved choice beats the API default, which checks the precedence order (saved, then API, then retail).                                                                                                                                        |
| `TransactionList/Transaction/Transaction.test.tsx` | D5           | ✓               |                      | Description, category and short date, `-`/`+` prefixes, and the `Pending` chip only when pending. Amounts are compared with `formatMoney(...)`, because `Intl` puts a non-breaking space after `SGD`.                                                                                                                                                        |
| `TransactionList/TransactionList.test.tsx`         | D5, D6       | ✓               |                      | Heading and row order, only the 8 newest, search by description or category ignoring case with the result count, and the no-matches message with `Clear search` bringing the list back. Waits for the real 300 ms debounce with `findBy*`.                                                                                                                   |
| `TransactionList/Search/Search.test.tsx`           | D6           | ✓               | ✓                    | Label and placeholder, `onChange` per keystroke, `onSearch` firing only after the delay, a new value restarting the timer, and unmounting dropping a pending search. Uses fake timers, with timings from the exported `delay`.                                                                                                                               |

E4 minimums: the failed-load-and-Retry test is done. The other two (an over-balance amount shows the error and sends no request; a successful transfer shows success and the dashboard updates) need the transfer dialog, which isn't built yet.

## AI use

Claude Code usage(s):

- CI/CD files setup
- Commit message generation
- Generating `css` styles for components
- Spec tests for components
- `ThemeProvider` and `SegmentSwitch` contexts
- Transaction search (`Search` debounce, filtering, tests)
- Refactoring toggles, buttons and the search input to Headless UI components

Three places where you changed, rejected or fixed what the AI produced:

- Claude Code's initial suggested implementation for the `Skeleton` component was

  ```tsx
  // Requires callers to directly pass CSS variables and/or rem values
  interface SkeletonProps {
    width?: string;
    height?: string;
    radius?: string;
  }

  export default function Skeleton({
    width = "100%",
    height = "1em",
    radius = "var(--radius-sm)",
  }: SkeletonProps) {
    return (
      <span
        className="skeleton"
        style={{ width, height, borderRadius: radius }}
        aria-hidden="true"
      />
    );
  }
  ```

  Modified to use BEM class modifiers for better readability

- Claude Code insisted `DashboardSkeleton` is not shown during retry. Manually added new test assertions to `App.test.tsx` to check for skeleton, test assertions pass.
- Claude Code presented searching the whole transaction history as a requirement; the brief doesn't say that. Reverted to the contract's option of filtering the 8 loaded rows, and recorded the ambiguity under Decisions.

## Not done / known issues

Not done: `D3`, `D4`, `D8`, `T1–T8`, `E3`, `E4` (partially implemented, only failed-load-and-Retry test is done)

Known issues:

- No empty transaction list state. If `/api/transactions` returns no rows, the section shows only its heading and search box. The brief lists "empty states" as required but only defines no search matches for transactions (`wireframes/wireframe.md` §7), so the copy and design are unspecified.
- A failed background refetch hides loaded data. TanStack Query refetches stale queries when the tab regains focus. If that refetch fails, `useCustomerDataQuery` reports `isError` even though the old data is still cached, so `RetryState` replaces a working dashboard. Fix: report an error only when a query fails and has no data.
- In-app browsers (e.g. opening the link from Slack or LinkedIn on iOS) and Safari private mode restrict service workers, so the mock API can't start. `main.tsx` still renders after its 2.5 s timeout, however `/api/*` requests get a 404 from Netlify, and the dashboard shows its error state. `Retry` can't recover; open the link in a normal browser window instead.

Potential areas of improvement:

- Use a custom debounce hook for the `Search` component. Either define one within the app or use an existing React library, e.g. [use-debounce](https://www.npmjs.com/package/use-debounce)
- Structure the `components` directory according to the Atomic Design pattern

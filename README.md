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

- **Theme (TH1):** An inline script in `index.html` applies the saved theme (or the system setting) to `<html data-theme>` before first paint, so there is no flash. `ThemeProvider` (`src/theme/ThemeContext.tsx`) starts from that value and exposes `theme` / `toggleTheme` via `useTheme()` for components that need the theme in JS. Styling itself comes from the design tokens keyed on `data-theme`, so most components never read the context.
- **Loading (D1):**
  - Created a custom hook `useCustomerDataQuery` that queries and retries all 3 endpoints (`/api/customer`, `/api/accounts`, `/api/transactions`) in parallel. `isLoading` is false until all queries are completed. At least a single query failing will return `isError` as true. The exposed `retry` method only retries failed queries and avoids refetching loading/successful queries.
  - Used BEM class modifiers to let the `Skeleton` expose named sizes (`xs|sm|md|lg|xl`, `sm|base|lg|xl|2xl|3xl`) as props, so callers no longer need to explicitly define and pass rem values.
- **Segment (TH2):** Target component for the switch is ambiguous. Selected a button group styled to appear like a `Switch` component from popular design library MUI.
  - The customer's `segment` from the API is the default (`brief/api-contract.md`), and a saved switch choice overrides it. `SegmentProvider` lives in `App` so it can receive that default once the customer loads.
  - Trade-off: the default is only known after `GET /api/customer` responds, so a premium customer with no saved choice sees retail colours for about 500 ms. Blocking the render until then would break the D1 skeleton. Possible fixes, not done to keep the provider simple: cache the last API segment in `localStorage` for the `index.html` script to apply before first paint (fixes repeat visits), and hide the brand-coloured `SegmentSwitch` until the customer loads (reduces the first-visit flash).
- **Search (D6):** The brief doesn't say where the clear control goes, only that there must be "a way to clear the search".
  - While a search has matches, a row above the list shows the result count (`N results`) with `Clear search` beside it. In the no-matches state that row hides and the required `Clear search` button sits under `No transactions match your search.`, so there's never more than one button with that name.
  - `TransactionList` holds the input text (`query`) and the debounced value (`searchTerm`, 300 ms) used for filtering. `Search` keeps the debounce timer in a `useEffect`, so a new keystroke or a clear cancels any search still waiting. `Clear search` resets both values, so the full list comes back straight away.
  - Which transactions search covers is ambiguous. D6 says "filter the list", and `brief/api-contract.md` allows either filtering "the 8 loaded rows" in the browser or using the API's `q` parameter. Neither says whether older transactions should be searchable. Chose the browser option: the dashboard requests `/api/transactions?limit=8` and search filters those 8 rows. It needs no extra request or loading state while typing, and it matches what the user can see. Trade-off: a transaction older than the 8 newest can't be found. Switching to `q` (with the debounced term in the query key) would fix that if it's wanted.

## Loading, empty and error states

How you handled them, and how to see each one in the deployed app.

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

Two or three places where you changed, rejected or fixed what the AI produced:

- Claude Code suggested writing the theme and segment write logic directly in the component files. Valid for this exercise, however holding the logic with React Context allows components such as icons to directly use the theme and segment values in code.
- Insufficient test coverage generated for the `App.test.tsx` render test; generated output only checked the final post-loading state. Added additional assertions to also validate the loading state.
- Initial suggested implementation for the `Skeleton` component was

  ```tsx
  // Require callers to directly pass CSS variables and/or rem values
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

Potential areas of improvement:

- Use a custom debounce hook for the `Search` component. Either define one within the app or use an existing React library, e.g. [use-debounce](https://www.npmjs.com/package/use-debounce)

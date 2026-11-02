# Meridian Banking — Caryl Peneyra

- Deployed: `https://fabulous-jalebi-b8c17d.netlify.app/`
- Run locally: `npm install && npm run dev`

## Project structure

Folders and what each is responsible for.

_TODO_: Add in folders to this section as you add them

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

Server state vs UI state, forms and validation, theming, anything you
chose deliberately, and what you'd change.

- **Theme (TH1):** an inline script in `index.html` applies the saved theme
  (or the system setting) to `<html data-theme>` before first paint, so there
  is no flash. `ThemeProvider` (`src/theme/ThemeContext.tsx`) starts from that
  value and exposes `theme` / `toggleTheme` via `useTheme()` for components
  that need the theme in JS. Styling itself comes from the design tokens keyed
  on `data-theme`, so most components never read the context.
- **Loading (D1):**
  - Created a custom hook `useCustomerDataQuery` that queries and retries all 3 endpoints (`/api/customer`, `/api/accounts`, `/api/transactions`) in parallel. `isLoading` is false until all queries are completed. At least a single query failing will return `isError` as true. The exposed `retry` method only retries failed queries and avoids refetching loading/successful queries.
  - Use BEM class modifiers to allow the `Skeleton` to expose named sizes (`xs|sm|md|lg|xl`, `sm|base|lg|xl|2xl|3xl`) as props. Callers no longer required to explicitly define rem sizing
- **Segment (TH2):** Target component for the switch is ambiguous. Selected a button group styled to appear like a `Switch` component from popular design library MUI.
  - The customer's `segment` from the API is the default (`brief/api-contract.md`), and a saved switch choice overrides it. `SegmentProvider` lives in `App` so it can receive that default once the customer loads.
  - Trade-off: the default is only known after `GET /api/customer` responds, so a premium customer with no saved choice sees retail colours for about 500 ms. Blocking the render until then would break the D1 skeleton. Possible fixes, not done to keep the provider simple: cache the last API segment in `localStorage` for the `index.html` script to apply before first paint (fixes repeat visits), and hide the brand-coloured `SegmentSwitch` until the customer loads (reduces the first-visit flash).
- **Search (D6):** The brief doesn't say where the clear control goes, only that there must be "a way to clear the search".
  - While a search has matches, a row above the list shows the result count (`N results`) with `Clear search` beside it. In the no-matches state that row hides and the required `Clear search` button sits under `No transactions match your search.`, so there's never more than one button with that name.
  - `TransactionList` holds the input text (`query`) and the debounced value (`searchTerm`, 300 ms) used for filtering. `Search` keeps the debounce timer in a `useEffect`, so a new keystroke or a clear cancels any search still waiting. `Clear search` resets both values, so the full list comes back straight away.
  - Which transactions search covers is ambiguous. D6 says "filter the list", and `brief/api-contract.md` allows either filtering "the 8 loaded rows" in the browser or using the API's `q` parameter. Neither says whether older transactions should be searchable. I chose the browser option: the dashboard requests `/api/transactions?limit=8` and search filters those 8 rows. It needs no extra request or loading state while typing, and it matches what the user can see. Trade-off: a transaction older than the 8 newest can't be found. Switching to `q` (with the debounced term in the query key) would fix that if it's wanted.

## Loading, empty and error states

How you handled them, and how to see each one in the deployed app.

## Tests

What they cover and why you picked those cases.

## AI use

Claude Code usage(s):

- CI/CD files setup
- Commit message generation
- Generating `css` styles for components
- Spec tests for components
- `ThemeProvider` and `SegmentSwitch` contexts

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

## Not done / known issues

What you left out or would do with more time.

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
│   ├── Header
│   │   ├── Header.css
│   │   ├── Header.test.tsx
│   │   └── Header.tsx
│   ├── SegmentSwitch
│   │   ├── SegmentSwitch.css
│   │   └── SegmentSwitch.tsx
│   └── ThemeToggle
│       ├── ThemeToggle.css
│       ├── ThemeToggle.test.tsx
│       └── ThemeToggle.tsx
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

## Loading, empty and error states

How you handled them, and how to see each one in the deployed app.

## Tests

What they cover and why you picked those cases.

## AI use

Which tools, and what for. Name two or three places where you changed,
rejected or fixed what the AI produced, and why.

Claude Code usage(s):

- CI/CD files setup
- Commit message generation
- Spec tests for `Header` / `ThemeToggle`, and the `ThemeProvider` context

## Not done / known issues

What you left out or would do with more time.

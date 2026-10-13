# AGENTS.md

CrowdUp: a crowdfunding front-end (Vite + React 18 + TypeScript + Mantine v6). Client-only, no backend or tests; all content comes from static JSON in `src/data/`.

## Commands

Yarn is the package manager (`yarn.lock`).

- `yarn dev` starts the Vite dev server
- `yarn build` runs `tsc` then `vite build` (type errors fail the build)
- `yarn lint` runs ESLint with `--max-warnings 0`, so any warning fails
- `yarn preview` serves the production build

There is no test runner configured.

## Architecture

- `src/main.tsx` -> `App.tsx` wraps everything in `MantineProvider` (custom theme from `src/theme`), `RouterProvider`, the Montserrat font loader (`src/fonts/MontserratFont`) and `Notifications`.
- `src/routes/index.tsx` is the single `createBrowserRouter` config. Each route pairs a layout from `src/layout` (`PublicLayout`, `DashboardLayout`) with a page from `src/pages` as its child, and uses `Error404Page` as the `errorElement`. Login and signup render without a layout.
- `src/pages`, `src/components`, `src/layout` and `src/helpers` each re-export through an `index.ts` barrel. When adding a file, export it from the barrel. Pages are imported with a `Page` suffix (e.g. `HomePage`).
- `src/sections/Home/` holds page-specific sections. Shared UI lives in `src/components`.
- `src/types/index.ts` holds shared types. `src/data/*.json` provides mock campaigns, countries, currencies, nav links, testimonials and the user.
- Charts use `react-apexcharts`. The rich text editor uses Tiptap with `@mantine/tiptap`.

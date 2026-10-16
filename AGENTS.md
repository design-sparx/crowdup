# AGENTS.md

CrowdUp: a crowdfunding front-end (Vite 8 + React 19 + TypeScript 6 + Mantine 9 + react-router-dom 7). Client-only, no backend or tests; all content comes from static JSON in `src/data/`.

## Commands

pnpm is the package manager (`pnpm-lock.yaml`). Use `pnpm`, not `npm` or `yarn`.

- `pnpm dev` starts the Vite dev server (default http://localhost:5173)
- `pnpm build` runs `tsc` then `vite build` (type errors fail the build)
- `pnpm lint` runs ESLint with `--max-warnings 0`, so any warning fails
- `pnpm preview` serves the production build

There is no test runner configured.

## Architecture

- `src/main.tsx` imports the Mantine stylesheets and renders `App.tsx`. `App.tsx` wraps everything in `MantineProvider` (custom theme from `src/theme`), `RouterProvider` and `Notifications`. It also imports the Montserrat font from `src/fonts/montserrat.css`.
- `src/routes/index.tsx` is the single `createBrowserRouter` config (from `react-router-dom`). Each route pairs a layout from `src/layout` (`PublicLayout`, `DashboardLayout`) with a page from `src/pages` as its child, and uses `Error404Page` as the `errorElement`. Login and signup render without `PublicLayout` or `DashboardLayout`.
- `src/pages`, `src/components`, `src/layout` and `src/helpers` each re-export through an `index.ts` barrel. When adding a file, export it from the barrel. Pages are imported with a `Page` suffix (e.g. `HomePage`).
- `src/sections/Home/` holds page-specific sections. Shared UI lives in `src/components`.
- `src/types/index.ts` holds shared types. `src/data/*.json` provides mock campaigns, countries, currencies, nav links, testimonials and the user.
- Charts use `react-apexcharts`. The rich text editor uses Tiptap with `@mantine/tiptap`.

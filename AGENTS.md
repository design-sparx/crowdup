# AGENTS.md

CrowdUp: a crowdfunding front-end (React Router 8 framework mode with server rendering, React 19, TypeScript 6, Mantine 9, Vite 8). No backend yet; content comes from static JSON in `src/data/`.

## Commands

pnpm is the package manager (`pnpm-lock.yaml`). Use `pnpm`, not `npm` or `yarn`.

- `pnpm dev` starts `react-router dev` (default http://localhost:5173)
- `pnpm build` runs `react-router typegen`, `tsc`, then `react-router build` (output in `build/client`; type errors fail the build)
- `pnpm lint` runs ESLint with `--max-warnings 0`, so any warning fails
- `pnpm preview` serves `build/client`
- `pnpm test` runs Vitest.

## Architecture

- `react-router.config.ts` sets `appDirectory: "src"` and `ssr: true`. `src/root.tsx` is the root: the HTML shell (Mantine `ColorSchemeScript` and `mantineHtmlProps`), `MantineProvider` with the theme from `src/theme`, `Notifications`, the stylesheets and the Montserrat font import.
- `src/routes.ts` is the route config. Each entry points at a thin route module in `src/routes/` that re-exports a page from `src/pages` as `default` and `Error404Page` (or `DetailError404Page`) as `ErrorBoundary`. Layout routes (`home-layout`, `public-layout`, `dashboard-layout`) wrap `PublicLayout` and `DashboardLayout` from `src/layout`. Login and signup have no layout. To add a page: create the page in `src/pages` and export it from the barrel, add a route module in `src/routes/`, and register it in `src/routes.ts`.
- `src/pages`, `src/components`, `src/layout` and `src/helpers` each re-export through an `index.ts` barrel. When adding a file there, export it from the barrel. Route modules in `src/routes/` are not barrelled. Pages are imported with a `Page` suffix (e.g. `HomePage`).
- Netlify deploys via `@netlify/vite-plugin-react-router` (generates the SSR handler; `netlify.toml` needs no redirects). Unknown paths render server-side with a real 404. Routes export `meta` built with `buildMeta` from `src/helpers`. Browser-only code (window, Tiptap `useEditor`) must be guarded: use effects or `immediatelyRender: false`. Run the production build locally with `react-router-serve build/server/index.js`.
- `src/sections/Home/` holds page-specific sections. Shared UI lives in `src/components`.
- `src/types/index.ts` holds shared types. `src/data/*.json` provides mock campaigns, countries, currencies, nav links, testimonials and the user.
- Charts use `react-apexcharts`. The rich text editor uses Tiptap with `@mantine/tiptap`.

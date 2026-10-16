# AGENTS.md

CrowdUp: an open-source, self-hostable donation crowdfunding app (React Router 8 framework mode with server rendering, React 19, TypeScript 6, Mantine 9, Vite 8) backed by Supabase (Postgres, Auth, Storage) and Stripe Connect. Deployed on Netlify. Operator docs are in `docs/` (start at `docs/README.md`).

## Commands

pnpm is the package manager (`pnpm-lock.yaml`). Use `pnpm`, not `npm` or `yarn`.

- `pnpm dev` starts `react-router dev` (default http://localhost:5173)
- `pnpm build` runs `react-router typegen`, `tsc`, then `react-router build` (output in `build/client`; type errors fail the build)
- `pnpm lint` runs ESLint with `--max-warnings 0`, so any warning fails
- `pnpm preview` serves the static `build/client` only (no SSR); to run the real server use `pnpm exec react-router-serve build/server/index.js`
- `pnpm test` runs Vitest unit tests (`src/**` and `scripts/**`; `e2e/` is excluded)
- `pnpm test:db` runs `supabase db reset` then `supabase test db` (pgTAP in `supabase/tests/database/`; needs Docker and the Supabase CLI)
- `pnpm test:e2e` runs Playwright (`e2e/`) against the production build on port 4173; run `pnpm build` first and have local Supabase running

## Architecture

- `react-router.config.ts` sets `appDirectory: "src"` and `ssr: true`. `src/root.tsx` is the root: the HTML shell (Mantine `ColorSchemeScript` and `mantineHtmlProps`), `MantineProvider` with the theme from `src/theme`, `Notifications`, the stylesheets and the Montserrat font import.
- `src/routes.ts` is the route config. Each entry points at a thin route module in `src/routes/` that re-exports a page from `src/pages` as `default` and `Error404Page` (or `DetailError404Page`) as `ErrorBoundary`. Layout routes (`home-layout`, `public-layout`, `dashboard-layout`) wrap `PublicLayout` and `DashboardLayout` from `src/layout`. Login and signup have no layout. To add a page: create the page in `src/pages` and export it from the barrel, add a route module in `src/routes/`, and register it in `src/routes.ts`.
- `src/pages`, `src/components`, `src/layout` and `src/helpers` each re-export through an `index.ts` barrel. When adding a file there, export it from the barrel. Route modules in `src/routes/` are not barrelled. Pages are imported with a `Page` suffix (e.g. `HomePage`).
- Netlify deploys via `@netlify/vite-plugin-react-router` (generates the SSR handler; `netlify.toml` needs no redirects). Unknown paths render server-side with a real 404. Routes export `meta` built with `buildMeta` from `src/helpers`. Browser-only code (window, Tiptap `useEditor`) must be guarded: use effects or `immediatelyRender: false`. Run the production build locally with `react-router-serve build/server/index.js`.
- `src/sections/Home/` holds page-specific sections. Shared UI lives in `src/components`.
- Data and server code: `supabase/migrations/` is the schema (RLS, security-definer functions, storage bucket); `supabase/seed.sql` is local sample data and `supabase/demo-seed.sql` is demo only. `src/data-access/<area>/` (auth, campaigns, donations, moderation, reports, stripe) holds `*.server.ts` modules wiring Supabase and Stripe to loaders and actions, plus unit-tested helpers beside them; `src/lib/<area>/` holds pure, unit-tested logic (status transitions in `src/lib/campaigns/transitions.ts` mirror the SQL). Stripe webhook: `src/routes/api-stripe-webhook.tsx`. The `/admin` area (reports, campaigns, users, approvals) is the `admin-layout` route with `admin-*` route modules.
- Configuration is server-side environment variables only (read via `process.env`, no `VITE_` vars). The full list is in `docs/self-hosting.md` and `.env.example`; add new variables to both and to `netlify.toml` `[template.environment]` if required.
- `src/types/index.ts` holds shared types. `src/data/*.json` still provides static countries, currencies, footer links, testimonials and a mock user (used by `UserButton`/`UserCard`); campaigns come from Supabase. Legal page text is configured in `src/data/legal.ts`.
- `scripts/` holds the demo reset (guarded, unit tested; app-side demo logic is in `src/lib/demo`). Tests: Vitest beside the code, pgTAP in `supabase/tests/database/`, Playwright specs in `e2e/`. CI is in `.github/workflows/` (CI, database permissions, end-to-end, demo reset, release-please); commits follow Conventional Commits.
- Charts use `react-apexcharts`. The rich text editor uses Tiptap with `@mantine/tiptap`.

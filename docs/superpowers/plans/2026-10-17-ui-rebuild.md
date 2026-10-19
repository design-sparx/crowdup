# CrowdUp UI Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete every Mantine screen and rebuild the 19 approved screens around donor, organiser and admin journeys on Tailwind and shadcn (Base UI), with Mantine removed.

**Architecture:** Server code (`src/data-access/**`, `src/lib/**`, `supabase/**`, the Stripe webhook route, route `loader`/`action` exports) is kept. Pages in `src/pages` and shared UI in `src/components` are rewritten; route modules in `src/routes` keep their loaders and actions and swap in the new page component. Forms are plain React Router `<Form>` with field errors returned by the existing server parsers, so the server stays the single source of validation.

**Tech Stack:** React Router 8 (SSR), React 19, TypeScript 6, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui on Base UI, `sonner`, `react-dropzone`, Tiptap (existing), `react-day-picker` (via shadcn calendar), `embla-carousel-react` (existing), `react-apexcharts` (existing), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-17-ui-rebuild-design.md`

## Global Constraints

- Nothing is pushed anywhere and no PR is opened until all tasks are done. Commits are local, on `main`, Conventional Commits.
- Mantine fully removed from `package.json` and `src` by Task 16; no screen mixes Mantine and Tailwind (Task 2 deletes all Mantine UI at once).
- Server behaviour unchanged except where a task says otherwise: `src/data-access/**`, `src/lib/**`, `supabase/**`, `src/routes/api-stripe-webhook.tsx` and their tests keep passing.
- Route module convention: thin `src/routes/*` modules; pages in `src/pages` re-exported through the `index.ts` barrel with a `Page` suffix; components through `src/components/index.ts`.
- Browser-only code (Tiptap `useEditor`, `window`) guarded for SSR (effects or `immediatelyRender: false`).
- `pnpm lint` has zero warnings allowed; `pnpm build` type-checks. pnpm only.
- Light and dark mode, mobile-first, keyboard accessible, visible focus, AA contrast.
- Env vars are server-side only; do not add `VITE_` vars.
- Playwright specs are rewritten with their screens (Tasks 3 to 14), not kept against deleted pages.
- Journey order: donor, organiser, admin, content pages.

## Review Focus

1. A visitor opens `/campaigns/:slug/thanks` directly without paying: the page shows no donor data and does not claim a donation was recorded.
2. Donor cancels at Stripe and returns: the campaign page shows a "payment cancelled" notice and the donate panel is usable again.
3. Organiser double-clicks Publish or refreshes after publishing: one transition, no error page, and "pending approval" is shown when approval mode is on.
4. Server render of the editor, dark-mode switch and sonner toaster: no hydration warning, no flash of the wrong theme, no `window` access on the server.
5. Admin inbox with zero items and a double-clicked "resolve": empty state shows, and the action is applied once.

---

### Task 1: Baseline and push guard

**Files:**
- Create: none (git config only)

**Interfaces:**
- Produces: a recorded green baseline and a local guard so nothing can be pushed by accident.

- [ ] **Step 1: Confirm the baseline** — run `pnpm lint && pnpm test && pnpm build`. Expected: all pass. Record any pre-existing failure in the commit message of Task 2; do not fix unrelated ones here.
- [ ] **Step 2: Block pushes locally** — run `git remote set-url --push origin DISABLED` so `git push` fails until the owner re-enables it. Verify with `git remote -v` (push URL reads `DISABLED`).
- [ ] **Step 3: Commit the spec and plan** — `git add docs/superpowers && git commit -m "docs: add UI rebuild spec and plan"`.

### Task 2: Delete the Mantine UI and install Tailwind + shadcn

**Files:**
- Delete: `src/pages/*.tsx` (keep `index.ts`, emptied), `src/layout/*`, `src/sections/`, `src/theme/`, all `src/components/*` that import `@mantine/*` or `*.module.css`, `src/pages/Dashboard.module.css`, `src/App.css`, `src/index.css`, `postcss.config.cjs`, `src/data/{Testimonials,User,Footer}.json` if unreferenced after deletion
- Modify: `src/root.tsx`, `vite.config.ts`, `tsconfig.json`, `package.json`, every `src/routes/*.tsx` that imports Mantine or a deleted page
- Create: `src/styles/globals.css`, `components.json`, `src/lib/utils.ts` (`cn`), `src/pages/ComingSoon.tsx`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` in `src/lib/utils.ts`; alias `@/` → `src/`; `ComingSoonPage({title}: {title: string}): JSX.Element` used by every route whose screen is not rebuilt yet, so `tsc` and `react-router build` stay green; shadcn primitives under `src/components/ui/`.

- [ ] **Step 1: Delete** every file listed above and remove each `@mantine/*` and `postcss-preset-mantine`/`postcss-simple-vars` dependency (`pnpm remove ...`). Keep `clsx`, Tiptap, `react-apexcharts`, embla, dayjs.
- [ ] **Step 2: Install** `tailwindcss @tailwindcss/vite tailwind-merge class-variance-authority sonner react-dropzone react-day-picker` and register `@tailwindcss/vite` in `vite.config.ts`. Add the `@` alias to both `tsconfig.json` `paths` and Vite `resolve.alias`.
- [ ] **Step 3: Initialise shadcn** with `pnpm dlx shadcn@latest init`, choosing Base UI as the primitive library and CSS variables for theming (check the current CLI docs for the exact flag; the choice, not the flag, is fixed). Add components as tasks need them via `pnpm dlx shadcn@latest add <name>`.
- [ ] **Step 4: Stub every route** — each `src/routes/*.tsx` that rendered a deleted page keeps its `loader`/`action`/`meta` and renders `<ComingSoonPage title="..."/>`. Delete component code that only served Mantine.
- [ ] **Step 5: Verify** `pnpm lint && pnpm test && pnpm build`. Expected: pass (unit tests for `src/lib` and `src/data-access` untouched). `grep -r "@mantine" src package.json` returns nothing.
- [ ] **Step 6: Commit** `refactor(ui): remove Mantine UI and add Tailwind and shadcn`.

### Task 3: Shell, theme and error pages (screens 1 and 2)

**Files:**
- Create: `src/components/shell/SiteHeader.tsx`, `SiteFooter.tsx`, `ThemeToggle.tsx`, `UserMenu.tsx`, `src/layout/Site.tsx`, `src/pages/NotFound.tsx`, `src/pages/ErrorPage.tsx`, `src/lib/theme.ts`
- Modify: `src/root.tsx`, `src/layout/index.ts`, `src/pages/index.ts`, `src/components/index.ts`, `src/routes/{home,public,dashboard,admin}-layout.tsx`
- Test: `src/lib/theme.test.ts`, `e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `type Theme = "light" | "dark" | "system"`; `themeInitScript: string` (inline script setting `class="dark"` on `<html>` before paint); `resolveTheme(stored: string | null, prefersDark: boolean): "light" | "dark"`; `SitePage` layout with header (logo, Browse, How it works, Start a campaign, user menu or Log in), footer (legal links), `<Toaster/>`; `NotFoundPage`, `ErrorPage` as `ErrorBoundary` targets.
- Consumes: `cn` from Task 2.

- [ ] **Step 1: Write failing tests** in `src/lib/theme.test.ts`: `resolveTheme(null, true)` is `"dark"`; `resolveTheme("light", true)` is `"light"`; `resolveTheme("garbage", false)` is `"light"`.
- [ ] **Step 2: Run** `pnpm test src/lib/theme.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `resolveTheme` and `themeInitScript` in `src/lib/theme.ts`; wire the script into `root.tsx` `<head>` and keep `DemoBanner` behaviour (rebuild it as a small shadcn `Alert` bar fed by `demoBannerState`).
- [ ] **Step 4: Build** header, footer, theme toggle and user menu; layouts render `SitePage`. Header nav collapses to a sheet below `md`.
- [ ] **Step 5: e2e** — update `e2e/smoke.spec.ts`: home renders header and footer; unknown path returns real 404 with a link home; theme toggle persists across reload.
- [ ] **Step 6: Verify** `pnpm lint && pnpm test && pnpm build && pnpm test:e2e e2e/smoke.spec.ts`. Check no hydration warning in the browser console (Review Focus 4).
- [ ] **Step 7: Commit** `feat(ui): add site shell, theme switch and error pages`.

### Task 4: Browse and home (screens 3 and 4)

**Files:**
- Create: `src/pages/Home.tsx`, `src/pages/Campaigns.tsx`, `src/components/CampaignCard.tsx`, `src/components/CampaignFilters.tsx`, `src/components/Progress.tsx`
- Modify: `src/routes/home.tsx`, `src/routes/campaigns.tsx`, barrels
- Test: `e2e/campaigns.spec.ts`

**Interfaces:**
- Consumes: `listCampaigns`, `listCategories`, `DEFAULT_PAGE_SIZE` from `src/lib/campaigns/repository.ts`; existing loader contracts unchanged.
- Produces: `CampaignCard({campaign}: {campaign: CampaignListItem})`; `CampaignFilters` (search box, category select, URL search params `q`, `category`, `page`).

- [ ] **Step 1: Write the e2e** (`campaigns.spec.ts`): browse shows seeded cards; typing in search and choosing a category narrows results and updates the URL; empty result shows an empty state with a "clear filters" link.
- [ ] **Step 2: Run** it. Expected: FAIL (stub pages).
- [ ] **Step 3: Implement** Home (hero with two buttons "Donate to a campaign" and "Start a campaign", featured campaigns from the existing loader, a three-step "how it works" strip) and Browse with pagination.
- [ ] **Step 4: Verify** `pnpm lint && pnpm build && pnpm test:e2e e2e/campaigns.spec.ts` passes. Take before/after screenshots for the final PR.
- [ ] **Step 5: Commit** `feat(donor): rebuild home and browse`.

### Task 5: Campaign page with donate panel (screen 5)

**Files:**
- Create: `src/pages/CampaignDetails.tsx`, `src/components/DonatePanel.tsx`, `src/components/StoryContent.tsx`, `src/components/UpdatesList.tsx`, `src/components/DonorsList.tsx`, `src/components/ShareButtons.tsx`, `src/components/ReportDialog.tsx`
- Modify: `src/routes/campaign-details.tsx` (component only; keep loader, action, meta), barrels
- Test: `e2e/donate.spec.ts`, `e2e/reports.spec.ts`

**Interfaces:**
- Consumes: `DONATION_PRESETS_MAJOR`, `parseDonationAmount`, `MAX_NAME`, `MAX_EMAIL`, `MAX_MESSAGE`; the existing `donate` and `report` intents posted to the campaign route; `loaderData.donationReturn: "success" | "cancelled" | null`.
- Produces: `DonatePanel({campaign, acceptingDonations, error}: {...})` posting `intent=donate` with fields `amount`, `name`, `email`, `message`, `anonymous`; sticky on desktop, bottom sheet on mobile.

- [ ] **Step 1: Update the e2e** (keep the existing NOT RUN header comment about needing Stripe): panel presets fill the amount; invalid amount `0.10` shows an `alert` containing "at least"; cancelled return (`?donation=cancelled`) shows a notice and a usable panel (Review Focus 2); report dialog submits and confirms.
- [ ] **Step 2: Implement** the page: cover, title, organiser, progress bar, tabs (Story, Updates, Donors), share buttons, report dialog, donate panel. Render `storyHtml` exactly as the loader provides (already allowlisted server-side); render update bodies as plain text.
- [ ] **Step 3: Verify** lint, build, and `pnpm test:e2e e2e/donate.spec.ts e2e/reports.spec.ts` (the Stripe-dependent cases skip without env, the rest pass).
- [ ] **Step 4: Commit** `feat(donor): rebuild campaign page with built-in donate panel`.

### Task 6: Thank-you route and Stripe return URL (screen 6)

**Files:**
- Create: `src/routes/campaign-thanks.tsx`, `src/pages/Thanks.tsx`
- Modify: `src/lib/donations/checkout.ts` (`success_url`), `src/lib/donations/checkout.test.ts`, `src/routes.ts`, `src/routes/campaign-details.tsx` (stop special-casing `donation=success`, keep `cancelled`), barrels
- Test: `src/lib/donations/checkout.test.ts`, `e2e/donate.spec.ts`

**Interfaces:**
- Consumes: `getCampaignBySlug`, `createPublicClient`.
- Produces: route `campaigns/:slug/thanks` (registered inside the public layout, before `campaigns/:slug`); loader returns `{campaign: {title, slug}}` or throws a 404 `Response`; `buildCheckoutSessionParams(...).success_url` is `${site}/campaigns/${slug}/thanks`; `cancel_url` unchanged (`?donation=cancelled`).

- [ ] **Step 1: Update the failing test** in `checkout.test.ts`: change the `success_url` assertion to `"https://crowdup.example/campaigns/clean-water/thanks"`.
- [ ] **Step 2: Run** `pnpm test src/lib/donations/checkout.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the `success_url` change in `buildCheckoutSessionParams`; Run the test. Expected: PASS.
- [ ] **Step 4: Build** the route and page: thank-you message naming the campaign, share buttons, link back to the campaign, and a "create an account to see your donations" prompt shown only to signed-out visitors. The page shows no donor or amount data and does not state that a donation was recorded (Review Focus 1).
- [ ] **Step 5: e2e** — direct visit to `/campaigns/<seeded-slug>/thanks` renders the thank-you text and no amount; unknown slug returns 404.
- [ ] **Step 6: Verify** lint, test, build, e2e for these specs.
- [ ] **Step 7: Commit** `feat(donor): add thank-you screen and return donors to it from Stripe`.

### Task 7: My donations (screen 7)

**Files:**
- Create: `src/pages/MyDonations.tsx`, `src/components/DonationHistoryTable.tsx`
- Modify: `src/routes/my-donations.tsx`, barrels
- Test: `e2e/donations.spec.ts`

**Interfaces:**
- Consumes: existing `src/data-access/donations/history.ts` loader data (unchanged).

- [ ] **Step 1: Update the e2e**: signed-in donor sees their rows with campaign link, amount and date; signed-out visitor is redirected to login with a safe `redirectTo`.
- [ ] **Step 2: Implement** a responsive table that becomes stacked cards below `md`, with an empty state linking to Browse.
- [ ] **Step 3: Verify and commit** `feat(donor): rebuild my donations`.

### Task 8: Sign-in screens (screens 8 to 10)

**Files:**
- Create: `src/layout/Auth.tsx` (rewrite), `src/pages/{Login,Signup,ForgotPassword,UpdatePassword}.tsx`, `src/components/{PasswordField,SignupConsent,GoogleButton}.tsx`
- Modify: `src/routes/{login,signup,forgot-password,update-password}.tsx`, barrels
- Test: `e2e/auth.spec.ts`

**Interfaces:**
- Consumes: existing `signInWithPassword`, `signUpWithPassword`, `startGoogleSignIn` actions and `intent=google`; `safeRedirect`.
- Produces: `PasswordField({name, label, error})` with show/hide toggle.

- [ ] **Step 1: Update the e2e**: wrong password shows an inline error; signup requires consent; forgot-password shows a confirmation without revealing whether the email exists; after login the user lands on the original `redirectTo`.
- [ ] **Step 2: Implement** the four screens on one centred auth layout with errors from `useActionData`.
- [ ] **Step 3: Verify and commit** `feat(auth): rebuild sign-in screens`.

### Task 9: Rich-text editor and cover upload components

**Files:**
- Create: `src/components/StoryEditor.tsx`, `src/components/CoverUpload.tsx`
- Test: `src/lib/campaigns/story.test.ts` (existing, must stay green); manual SSR check

**Interfaces:**
- Produces: `StoryEditor({name, defaultValue, error}: {name: string; defaultValue?: string; error?: string})` rendering Tiptap with the same extensions as `src/lib/campaigns/storyExtensions.ts` and writing Tiptap JSON into a hidden input `name`; `CoverUpload({name, defaultUrl, error})` using `react-dropzone`, preview, accepts the types and size already enforced by `src/lib/campaigns/cover.ts`.

- [ ] **Step 1: Implement** both with `immediatelyRender: false` and no `window` use during render (Review Focus 4). Toolbar built from shadcn `Toggle`/`Button`, no `@mantine/tiptap`.
- [ ] **Step 2: Verify** `pnpm build` passes, `pnpm exec react-router-serve build/server/index.js` renders a page containing the editor with no console hydration warning, and `pnpm test src/lib/campaigns` still passes.
- [ ] **Step 3: Commit** `feat(ui): add story editor and cover upload components`.

### Task 10: New campaign, guided steps (screen 11)

**Files:**
- Create: `src/pages/CreateCampaign.tsx`, `src/components/campaign/{StepIndicator,BasicsStep,StoryStep,GoalStep,PreviewStep}.tsx`, `src/components/{CurrencySelect,CountrySelect,CategorySelect}.tsx`
- Modify: `src/routes/create-campaign.tsx`, barrels
- Test: `e2e/create-campaign.spec.ts`

**Interfaces:**
- Consumes: `handleCampaignForm({...})` and `parseCampaignForm(form)` returning `CampaignFormErrors`; `src/data/{Countries,Currencies}.json`. Campaign saves as a `draft` before Stripe is connected.
- Produces: `StepIndicator({steps: string[]; current: number})`; steps are client-side panels of one `<Form>`; the final submit posts every field once so server validation stays the source of truth; step-level "Next" only checks required fields natively.

- [ ] **Step 1: Update the e2e**: complete the four steps, preview shows entered title and story, submit creates a draft and lands on the Connect Stripe screen (or Publish result if Stripe is already connected); server field errors send the user back to the step containing the first error.
- [ ] **Step 2: Implement** the steps; preview renders the story with the same server-side story renderer path used on the campaign page, so what is previewed matches what is published.
- [ ] **Step 3: Verify and commit** `feat(organiser): rebuild campaign creation as guided steps`.

### Task 11: Connect Stripe and publish result (screens 12 and 13)

**Files:**
- Create: `src/pages/ConnectStripe.tsx`, `src/pages/PublishResult.tsx`, `src/components/StripeStatus.tsx`
- Modify: `src/routes/{stripe-connect,stripe-return,stripe-refresh,stripe-publish}.tsx` (keep actions and redirects, add UI where a page renders), `src/routes.ts` only if `/campaigns/:id/publish` needs a GET page, barrels
- Test: `e2e/lifecycle.spec.ts`, `e2e/approval.spec.ts`

**Interfaces:**
- Consumes: `beginOnboarding`, `refreshOnboarding`, `readConnectSummary`, `getPublishingMode`, `publishDraft(userId, campaignId)` returning `"not_found" | "live" | "pending_approval" | ...` (confirm exact union in `connect.server.ts`).
- Produces: `PublishResult({result, shareUrl})` showing "live" with a copy-link button, or "pending approval" explaining the wait (Review Focus 3); publish button disables after the first click.

- [ ] **Step 1: Update the e2e**: approval mode shows "pending approval"; auto mode shows "live" with a link; reloading the result page does not error.
- [ ] **Step 2: Implement** the explainer ("why Stripe") screen, return/refresh status handling and the result screen. Keep every redirect target and query param the server already emits.
- [ ] **Step 3: Verify and commit** `feat(organiser): rebuild Stripe connect and publish result`.

### Task 12: Dashboard (screen 14)

**Files:**
- Create: `src/pages/Dashboard.tsx`, `src/layout/Dashboard.tsx` (rewrite), `src/components/{OrganiserCampaignsTable,StatCard,NextStepCard,DonationsChart}.tsx`
- Modify: `src/routes/{dashboard,dashboard-layout}.tsx`, barrels
- Test: `e2e/dashboard.spec.ts`

**Interfaces:**
- Consumes: `getDashboardData`, `readConnectSummary`, `getOwnSuspension`, `userSuspensionNotice`; loader shape unchanged.
- Produces: `NextStepCard` chosen from state: no Stripe → "Connect Stripe"; draft → "Publish"; live → "Share"; suspended account shows a destructive `Alert` with the reason.

- [ ] **Step 1: Update the e2e**: new organiser sees "Connect Stripe" prompt; live campaign shows raised amount and status badge; suspended user sees the notice.
- [ ] **Step 2: Implement** with `react-apexcharts` guarded for SSR (client-only render). **Step 3:** verify and commit `feat(organiser): rebuild dashboard`.

### Task 13: Manage campaign (screen 15)

**Files:**
- Create: `src/pages/EditCampaign.tsx`, `src/components/campaign/{LifecyclePanel,PostUpdateForm,CampaignDonors}.tsx`
- Modify: `src/routes/edit-campaign.tsx`, barrels
- Test: `e2e/lifecycle.spec.ts`

**Interfaces:**
- Consumes: existing intents `close`, `post-update`, the edit form via `handleCampaignForm`, `parseUpdateBody`, `MAX_UPDATE_LENGTH`; `?publish=` query result.
- Produces: one page with Edit form (reusing the Task 10 step components in a single-page layout), a post-update box with live character count, donors list, and a close button behind a confirmation dialog.

- [ ] **Step 1: Update the e2e**: posting an update appears on the public campaign page; over-length update shows the server error; closing asks for confirmation; editing a live campaign in approval mode shows it returned to pending.
- [ ] **Step 2: Implement; verify; commit** `feat(organiser): rebuild campaign management`.

### Task 14: Admin inbox (screen 16)

**Files:**
- Create: `src/pages/AdminInbox.tsx`, `src/layout/Admin.tsx` (rewrite), `src/components/admin/{InboxTabs,ReportsTab,ApprovalsTab,PaymentsTab,CampaignsTab,UsersTab}.tsx`
- Modify: `src/routes/admin-*.tsx`, `src/routes.ts` (collapse to `admin` with tab as a search param, or keep nested routes rendering into one tabbed layout; keep existing action contracts either way), barrels
- Test: `e2e/moderation.spec.ts`, `e2e/reports.spec.ts`, `e2e/approval.spec.ts`

**Interfaces:**
- Consumes: the existing admin loaders/actions (`intent=dismiss|suspend|restore|unsuspend|resolve`) and the count queries already used for the report badge (find them in the current admin layout loader).
- Produces: `InboxTabs` with a count badge per tab (reports, approvals, payments); each tab keeps its own action; empty state per tab (Review Focus 5); submit buttons disable while pending.

- [ ] **Step 1: Update the e2e**: admin sees counts, dismisses a report, approves a campaign, suspends and restores a user; non-admin gets 404 or redirect exactly as today; empty tab shows an empty state.
- [ ] **Step 2: Implement; verify; commit** `feat(admin): replace admin pages with one tabbed inbox`.

### Task 15: Content pages (screens 17 to 19)

**Files:**
- Create: `src/pages/{HowItWorks,Terms,Privacy,Security}.tsx`, `src/components/LegalDocument.tsx`
- Modify: `src/routes/{how-it-works,terms,privacy,security}.tsx`, barrels
- Test: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: `src/data/legal.ts` text (unchanged).

- [ ] **Step 1: Extend** the smoke spec: each of the four paths returns 200 with an `h1`.
- [ ] **Step 2: Implement** with a readable prose layout (`max-w-prose`, heading anchors, last-updated line from `legal.ts` if present).
- [ ] **Step 3: Verify and commit** `feat(content): rebuild how it works and legal pages`.

### Task 16: Final cleanup and verification

**Files:**
- Modify: `AGENTS.md`, `docs/README.md`, `README.md` (stack lines and screenshots), `.github/workflows/*` if they reference deleted files, `package.json`
- Delete: any leftover `ComingSoonPage` usage and file

**Interfaces:**
- Produces: a branch ready to review; no push has happened.

- [ ] **Step 1: Prove Mantine is gone** — `grep -ri "mantine" src package.json postcss.config.* vite.config.ts` returns nothing; `pnpm install --frozen-lockfile` clean after `pnpm install`.
- [ ] **Step 2: Update docs** — `AGENTS.md` (stack line, remove "Mantine 9", describe Tailwind, shadcn on Base UI, `src/components/ui`, the screen list), `docs/` where Mantine or removed routes are mentioned.
- [ ] **Step 3: Full verification** — `pnpm lint && pnpm test && pnpm build && pnpm test:db && pnpm test:e2e`. Expected: all pass (Stripe-dependent e2e cases skip without env). Run the production server and walk each journey once in the browser in light and dark, at mobile and desktop widths; fix issues found.
- [ ] **Step 3b: Screenshots** — capture before (from `origin/main`, old app) and after for each journey for the eventual PR; draft the PR body with a `## Diagram` section (Mermaid of the three journeys from the spec) and a `## Video` placeholder. Do not open the PR.
- [ ] **Step 4: Clean up** dev servers and background processes. Commit `docs: update stack and screen documentation for the UI rebuild`.
- [ ] **Step 5: Hand back** — tell the owner the work is complete locally and that pushing is disabled (`git remote set-url --push origin https://github.com/design-sparx/crowdup.git` re-enables it).

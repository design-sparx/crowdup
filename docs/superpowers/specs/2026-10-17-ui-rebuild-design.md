# CrowdUp UI rebuild: journey-based screens on Tailwind + shadcn

Status: draft for approval. Date: 2026-10-17.

## Intent

The current UI is a set of pages with no flow: the organiser's path is spread over five places, donating happens in a drawer, and admin is six separate tables. The owner wants every screen deleted and rebuilt around three journeys, each with one entry point and one obvious next step per screen. The rebuild also replaces Mantine with Tailwind and shadcn (Base UI) because the owner finds it more flexible and it is the stack most open-source contributors already know (goal: GitHub stars, contributors, real fundraisers).

## Goals

- Three journeys, built in this order: donor, organiser, admin.
  - Donor: campaign page (donating built in) → amount → details or guest → Stripe → thank you and share. No account needed.
  - Organiser: sign up → connect Stripe → write campaign → preview → publish → share and track → post update. One guided setup with a progress indicator; the dashboard is a home base afterwards, not the start.
  - Admin: one inbox (reports, approvals, unmatched payments) with filters → open item → decide → back to inbox. Replaces the six `/admin/*` pages.
- Mantine fully removed from `package.json` and `src` at the end. No screen mixes the two systems.
- Light and dark mode, mobile-first, accessible (keyboard, focus, contrast).

## Non-goals

- No change to server behaviour: `src/data-access/**`, `src/lib/**`, `supabase/**`, the Stripe webhook route and their tests stay and keep passing.
- Organisations, teams, public API, webhooks, Docker Compose: separate later specs.
- No new product features beyond what each journey needs to make sense (for example the donor thank-you step and organiser preview).
- No change of host, database, or licence (Netlify, Supabase, MIT).

## Anti-goals

- A half-migrated app where some screens are Mantine and some Tailwind.
- A broken `main` or demo while the rebuild is in progress.
- Visual polish that hides a confusing flow. Flow first, styling second.

## Constraints

- Stack is fixed by earlier decisions: React Router 8 framework mode with SSR, Supabase, Stripe Connect, Netlify. See `AGENTS.md`.
- Route module convention stays: thin `src/routes/*` modules re-export pages. Loaders/actions keep their current contracts unless a journey needs a change, in which case the change is made in `data-access` with tests.
- Browser-only code must stay guarded for SSR (editor, window).
- `pnpm lint` has zero warnings allowed; `pnpm build` type-checks.

## Decisions made by the owner

1. Delete all existing pages and rebuild, not journey-by-journey refactoring. (Reversed my recommendation; their call.)
2. Order: donor, organiser, admin.
3. UI stack: Tailwind and shadcn with Base UI primitives; Mantine removed entirely.
4. Everything feels clunky today, so no single priority fix beyond the order above.
5. **Delete up front (option A).** The old pages are removed first. The branch cannot run the old app and may not build or pass e2e until the donor and organiser journeys exist. Mantine and Tailwind never coexist.
6. **No pushing until the whole rebuild is done.** Nothing goes to `main` or to any remote branch, and no PR is opened, until all three journeys are finished. All work and commits stay local. The deployed demo keeps running the old app from `main` meanwhile.

## Calls made by me (check these)

- **Branch strategy (owner's call):** work directly on local `main`, which already contains the former `integration/spec-3-open-source` work (PR #29). Commit locally often. Nothing is pushed until all three journeys are done, per decision 6. Consequence: local `main` diverges from `origin/main`, so an urgent fix to the live old app cannot be pushed from here without also pushing the unfinished rebuild. If that happens, make the fix on a separate branch cut from `origin/main`.
- **Base UI over Radix** for shadcn primitives (Radix's long-term maintenance looks less certain).
- **Replacements for Mantine packages:** forms: react-hook-form with zod; file upload: react-dropzone; rich text: keep Tiptap with own styling (drop `@mantine/tiptap`); dates: shadcn calendar with react-day-picker; notifications: sonner; carousel: embla (via shadcn carousel); hooks: small local hooks or `usehooks-ts`.
- **Keep** `react-apexcharts` unless a lighter option is clearly better during the organiser journey.
- **Playwright specs** are rewritten with their screens, not kept against deleted pages.
- The first slice (donor) also sets up Tailwind, shadcn, theme tokens, root layout and the shared shell, so later journeys reuse it.
- Legal pages, how-it-works, security and 404 pages are rebuilt last as simple content pages using the same shell.

## Calls added after the builder check (also mine, check these)

- **Organiser order follows the server rules** (`src/lib/campaigns/transitions.ts`): a campaign can be a draft before Stripe is connected; Stripe readiness moves it to `live` (auto mode) or `pending_approval` (approval mode). So the journey is sign up → write campaign (draft) → connect Stripe → publish, and the publish step must show a "pending approval" state when approval mode is on. The earlier "connect Stripe first" order is dropped.
- **Server is the source of truth for validation.** Client zod schemas are shared with the server actions where practical, not duplicated.
- **Donation contracts stay.** Checkout redirect, guest and anonymous handling, and the webhook are kept. The thank-you and share step may need a small new return route or lookup; that is data-access work with tests and is in scope.
- **Admin inbox is tabs and filters over the existing queries**, not a new unified query. A unified paginated list is a later improvement.
- **Wireframes** from the review session are rough and not binding; the journey descriptions above are the source. They live in `.lavish/flow-redesign.html` (not committed).
- **Verification is local** since nothing is pushed. After the first journey lands, lint, unit tests and build should pass on every commit; e2e is rebuilt per journey and only needs to pass once its journey exists. Server-side unit tests and pgTAP stay green throughout.
- **Anti-goal "broken main"** is met because main is never touched until the end; the broken-branch state is accepted under option A.

## Approved screen list (owner approved 2026-10-17)

19 screens, in build order. Shell and 404 first, then:
1. **Donor:** Home `/`, Browse `/campaigns`, Campaign page `/campaigns/:slug` (donate panel built in), Thank you `/campaigns/:slug/thanks` (new route), My donations `/dashboard/donations`.
2. **Sign in and organiser:** Login, Sign up, Forgot/reset password; New campaign `/create-campaign` (guided steps, draft before Stripe), Connect Stripe (`/stripe/connect`, return, refresh), Publish result `/campaigns/:id/publish` (live or pending approval), Dashboard `/dashboard`, Manage campaign `/campaigns/:id/edit` (edit, post update, donors, close).
3. **Admin:** one inbox `/admin` with tabs (reports, approvals, unmatched payments, campaigns, users).
4. **Content, last:** How it works, Terms and Privacy, Security.

Non-screen routes stay: `auth/callback`, `logout`, `api/stripe/webhook`.

Verified: posting a campaign update already exists server-side (`postUpdate` in `src/data-access/campaigns/ownerCampaigns.ts`, `post-update` intent in `src/routes/edit-campaign.tsx`). No new server work is needed for it; only the screen is rebuilt.

## What is left to the builder

- Visual design: palette, type, spacing, component look. The wireframes shown in review were rough, not final.
- Exact screen breakdown and copy within each journey.
- Whether donor amount/details/payment are one screen with steps or sequential routes, as long as no account is required and Stripe handles payment details.
- Admin inbox data shape (can be one loader querying existing data-access functions).

## Done means

- Every route in `src/routes.ts` serves a new screen; no import from `@mantine/*` remains; `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e` pass.
- A new visitor can donate to a published campaign as a guest in under a minute; a new organiser can go from signup to a published campaign following only on-screen next steps.
- Before/after screenshots and a Mermaid diagram of the journeys in the PR.

# UI rebuild: tracker (read this first in every new session)

Last updated: 2026-10-17. Local `main` was at `da27587` when this was written. **Nothing is pushed.** The push remote is disabled on purpose.

To resume in a new Claude session, say:

> Read `docs/superpowers/plans/2026-10-17-ui-rebuild-tracker.md` and continue with the next task.

Related files (all in this folder or `docs/superpowers/specs/`):

| File | What it is |
|---|---|
| `specs/2026-10-17-ui-rebuild-design.md` | The approved design: intent, decisions, the 19-screen list. Binding. |
| `plans/2026-10-17-ui-rebuild.md` | The original 16-task plan. **Its file paths are stale** (it says `src/pages`, `src/components`); use `src/features/<journey>/` as written here. |
| `plans/2026-10-17-handover-task-N-*.md` | Self-contained instructions for one task, written for a weaker agent. Tasks 3, 4, 5 exist. |
| `AGENTS.md` | Project conventions, including the new "Conventions for the rebuilt UI" section. |

## The goal in one paragraph

Delete every Mantine screen and rebuild the UI around three journeys (donor, organiser, admin) on Tailwind v4 and shadcn (Base UI), keeping all server code (`src/data-access/**`, `src/lib/**`, `supabase/**`, loaders and actions) and its tests. Work on local `main`. **Do not push, merge or open a PR until all three journeys are done.**

## Status

| # | Task | Status | Commits |
|---|---|---|---|
| 1 | Baseline and push guard | Done | `f201438` |
| 2 | Delete Mantine UI, install Tailwind | Done | `4548b76` |
| - | shadcn init, emerald theme, 63 components, dead deps removed, conventions in `AGENTS.md` | Done | `efeb13b`, `8ea1a42`, `f46a562`, `08bc898` |
| 3 | Shell, theme switch, error pages | Done | `854232d`..`e5923c1`, fixes `4d7a554` |
| 4 | Home and browse | Done | `3b59f46`..`056e047`, fixes `7d65ecd`, `8b454ad`, `9794e74`, `4dc9f65` |
| 5 | Campaign page with built-in donate panel | Done | `6a7e0d5`..`29441df`, fixes `6f4ad51`, `04543e0`, `da27587` |
| 6 | Thank-you route and Stripe return URL | Done. Share link fixed (shares the campaign URL from `SITE_URL`) | `0537377`..`52dd044`, fixes `0166e7a`, `c77bca3` |
| 7 | My donations | Done. Signed-in e2e passes (seed links Dana's donations to her account) | `1f2dd8e`..`9636eaf`, fix `c891811` |
| 8 | Sign-in screens (login, signup, forgot, reset) | Done. Server rejects signups without consent | `3eed159`..`2072d8f`, fixes `f5dc7cb`, `6120d29` |
| 9 | Story editor and cover upload components | Done (wired into the Task 10 form) | `55a0dd0`..`2e74f7e`, fixes `2172423`, `719d316` |
| 10 | New campaign, guided steps | Done | `05a3e37`..`d1b46f5`, fixes `4031ed9`, `c1cc652` |
| 11 | Connect Stripe and publish result | Done (components and Stripe prompt; publish result shows on the manage page) | `229f2f9`, `25e0264`, `e62d93b` |
| 12 | Dashboard | Done | `ce36ef4`..`b63aa53` |
| 13 | Manage campaign | Done | `1024888`..`89d31be`, fixes `947a393`, `c135525` |
| 14 | Admin inbox | Done. Five tabs with counts; every action button disables while pending | `8d5f9dd`..`524a1ac` |
| 15 | Content pages (how it works, terms, privacy, security) | Done. Legal text is the operator template from `legal.ts`, with a template notice | `c12ed73`..`3b0b8e4`, fix `e22c6b7` |
| 16 | Final cleanup, docs, full verification | Done. Mantine and Lucide gone; placeholder deleted; docs updated; full verification passes; admin tabs fixed for phones | `8a2b16a`..`27fc94d`, fix `71f2078` |

**Current health (as of `27fc94d`):** lint clean, 113 test files / 587 tests pass, build exits 0, `pnpm test:db` 193 pgTAP tests pass, e2e (full suite) 43 passed, 1 skipped (Stripe checkout, needs a Stripe test key).

No route shows the "being rebuilt" placeholder any more. The legal pages show a template notice until the operator reviews them.

The admin specs are rewritten for the tabbed inbox (`e2e/admin.spec.ts`). The approve, reject, suspend and restore actions are covered by component tests, not end to end, since they change shared seed data.

## Task 6: what the next session must know

Goal: `/campaigns/:slug/thanks`, the page Stripe sends donors to after paying.

Facts already checked in the repo:
- `src/lib/donations/checkout.ts` builds `success_url` as `${page}?donation=success` (line about 76) and `cancel_url` as `${page}?donation=cancelled`. The unit test `checkout.test.ts` line about 48 pins the old success URL; change both together, test first.
- The campaign loader (`src/routes/campaign-details.tsx`) turns `?donation=success` into `donationReturn: "success"` and the page shows a thank-you alert. After the new route exists that alert is dead for new payments. Keep `cancelled`. Decide whether to keep `success` handling for old links (cheap: keep).
- Register the route in `src/routes.ts` inside the `site-layout` group, e.g. `route("campaigns/:slug/thanks", "routes/campaign-thanks.tsx")`. Add a thin route module with a loader that returns `{campaign: {title, slug}}` using `getCampaignBySlug(createPublicClient(), slug)` and throws a 404 `Response` when missing.
- The page must not show an amount or claim a donation was recorded (the webhook records it, possibly after the redirect). Visiting it directly without paying must be harmless.
- Reuse `ShareButtons` and the page layout style from Task 5.

**Decision needed from the owner (found while researching):** the original plan says the thank-you page prompts signed-out visitors to "create an account to see your donations". That is **not true**. The `my_donation` database view matches on `donor_user_id` only, never on email, by design (guest donations made with the same email are deliberately not exposed). A guest who signs up later will **not** see that donation. Options:
- **A (recommended):** change the copy. Signed-out visitors see "Want a receipt? Check your email" is also wrong (no app emails in v1). So say nothing about accounts; just thank, share, link back. Signed-in donors get a link to "My donations".
- **B:** build donation claiming (link guest donations to an account by verified email). Real feature, needs a migration and tests. Out of scope for this rebuild.

Also note: `/signup` and `/login` are placeholders until Task 8, so any link to them is a dead end for now.

## Open decisions and loose ends

- Task 6 account-prompt copy (above).
- Delete the 8 chat/AI shadcn components (`bubble`, `message`, `message-scroller`, `questionnaire`, `trace`, `attachment`, `code-block`, `marker`) and the packages only they use (`shiki`)? Asked, not answered. Other leftover packages from the component set: `@shadcn/react`, `cmdk`, `input-otp`, `react-resizable-panels`.
- `components.json` has `rtl: true` (from the preset). Harmless; keep or turn off.
- Old plan file paths are stale (see table above). Task 16 updates `AGENTS.md`'s Architecture section (still mentions Mantine, barrels, `src/pages`).
- Untracked agent report files in `docs/superpowers/plans/` (`*-report.md`): delete or commit as you like.
- Re-enable pushing only when you decide: `git remote set-url --push origin https://github.com/design-sparx/crowdup.git`.
- Running `pnpm test:db` resets the local database and does not reload the demo passwords. Reapply `supabase/demo-seed.sql` before the sign-in e2e specs.

## Pre-merge checklist (do in Task 16)

Needs your Stripe **test** key in `.env.local` (`STRIPE_SECRET_KEY=sk_test_...`) and one connected test account. Not verifiable without them; the agent environment has neither a key nor the Stripe CLI.
1. Donate form posts and the browser lands on `checkout.stripe.com` (set `E2E_DONATE_CAMPAIGN_URL`; un-skips the Stripe test in `e2e/donate.spec.ts`).
2. After paying, Stripe lands on `/campaigns/:slug/thanks`.
3. Cancelling lands on the campaign page with the "not charged" notice.
4. The webhook records the donation, and it appears in the donors list.
5. Logged-in checks: the account menu and logout button in the header, and the mobile menu (never exercised in a browser with a signed-in user).
6. Walk each journey once in light and dark, mobile and desktop.
7. PR body needs a `## Diagram` (Mermaid of the three journeys) and a `## Video` placeholder, plus before/after screenshots (before = old app from `origin/main`).

## Deferred minor findings (from reviews)

- Task 2: `ScrollToTop` removed already; nothing outstanding.
- Task 4: seed cover URLs are fake (`images.example`); the card now falls back to a placeholder, so fine.
- Task 5: no test for the real Stripe redirect; covered by the pre-merge checklist.
- Task 5: `ShareButtons` social links work; clipboard paths are tested.

## How each task is run (the loop)

1. **Controller (Claude) writes a handover file** `plans/2026-10-17-handover-task-N-<name>.md`: exact code, exact tests, exact commands, expected output, forbidden paths, stop conditions. Verify every assumption it makes against the repo first (icon names, component props, seed data, counts).
2. **You run it** on a free agent (Kilo) and say "done".
3. **Controller reviews**: read the agent's report, then **re-run everything itself** (`pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e` with `.env.local` loaded), read the diff, and test anything that smells. Fix findings in **separate commits**, bug fixes with a failing test first.
4. Record the result in the working notes and commit. Only then start the next task.

Env for e2e: `set -a && . ./.env.local && set +a`, local Supabase running (`pnpm exec supabase status`), then `pnpm build && pnpm test:e2e <specs>`. If the seed looks wrong: `pnpm exec supabase db reset` (local database only).

## Rules every handover must include (learned the hard way)

1. Never push, never open a PR.
2. Save files as **UTF-8, LF**. (One agent saved a spec as UTF-16; Playwright could not read it and the agent's reported results were impossible.) Run `file e2e/*.spec.ts` afterwards.
3. **Never weaken an assertion** to make a test pass; stop and report instead. (One agent swapped a by-role check for a label lookup; the real cause was shadcn pagination links rendering `role="button"`.)
4. **Paste real command output** for e2e (the `N passed / N skipped / N failed` lines), never a summary. e2e is mandatory when `.env.local` and local Supabase exist; "env not set" is not a valid reason to skip.
5. Do not edit `src/data-access/**`, `src/components/ui/**` (generated), `supabase/**`, or any loader/action/meta/ErrorBoundary export unless the task says so.
6. Kebab-case files and folders; one folder per component with `name.tsx`, `name.test.tsx`, one-line `index.ts`. No aggregate barrels. Component tests start with `// @vitest-environment jsdom`.
7. Tabler icons only, `cn()` for classes, theme tokens only (no raw colours), `@/` imports.
8. Avoid shadcn `PaginationLink/Previous/Next` (they render `<a role="button">`).
9. Anything that reads `window` or the viewer's timezone must not differ between server and browser render. Format dates with `src/helpers/formatDate.ts` (UTC). Use `useSyncExternalStore` for browser-only values.
10. e2e that click right after `goto` must first `await page.waitForLoadState("networkidle")`: server-rendered buttons are inert until React hydrates. Do not run report-submitting tests with `--repeat-each` against one server (5 reports/hour limit).
11. Kill dev servers and background processes before finishing.

## Where each remaining task builds (from the original plan, updated paths)

- **7 My donations** `src/features/donate/`, route `my-donations.tsx` (loader exists: `listMyDonations`), responsive table that becomes cards below `md`, empty state links to Browse, signed-out redirects to login with a safe `next`. Old e2e: `e2e/donations.spec.ts`.
- **8 Sign-in** `src/features/auth/`: login, signup (consent), forgot, update password; actions exist (`signInWithPassword`, `signUpWithPassword`, `startGoogleSignIn`, intent `google`); `safeRedirect` for `next`. Also verify the header account menu and logout in a browser here. Old e2e: `e2e/auth.spec.ts`.
- **9 Editor and upload** `src/features/organiser/`: `StoryEditor` (Tiptap, `immediatelyRender: false`, writes JSON into a hidden input, same extensions as `src/lib/campaigns/storyExtensions.ts`) and `CoverUpload` (`react-dropzone`, limits from `src/lib/campaigns/cover.ts`). Must render on the server without hydration warnings.
- **10 New campaign** guided steps with a progress indicator; a draft is saved before Stripe is connected; server parsers (`parseCampaignForm`, `handleCampaignForm`) stay the source of truth for errors. Old e2e: `e2e/create-campaign.spec.ts`.
- **11 Connect Stripe and publish result** screens around `beginOnboarding`, `refreshOnboarding`, `readConnectSummary`, `publishDraft`; show "live" with a copy link, or "pending approval" when approval mode is on; the publish button must not double-submit. Old e2e: `lifecycle.spec.ts`, `approval.spec.ts`.
- **12 Dashboard** `getDashboardData`, `readConnectSummary`, suspension notice; next-step card (connect Stripe, publish, share); charts via shadcn `chart` (recharts; `react-apexcharts` was removed). Old e2e: `dashboard.spec.ts`.
- **13 Manage campaign** edit form (reuse Task 10 steps), `post-update` and `close` intents (server code already exists), donors list, close behind a confirmation dialog. Old e2e: `lifecycle.spec.ts`.
- **14 Admin inbox** one tabbed page over the existing queries (reports, approvals, unmatched payments, campaigns, users) with a count badge per tab; keep every existing action contract (`dismiss`, `suspend`, `restore`, `unsuspend`, `resolve`); non-admins still get a 404. Old e2e: `moderation.spec.ts`, `reports.spec.ts`, `approval.spec.ts`.
- **15 Content pages** simple prose layout from `src/data/legal.ts`; smoke e2e that each path returns 200 with one `h1`.
- **16 Cleanup** no `mantine`/`lucide` anywhere, `AGENTS.md` + `docs/` updated, delete `ComingSoonPage`, full verification (`pnpm lint && pnpm test && pnpm build && pnpm test:db && pnpm test:e2e`), the pre-merge checklist above, screenshots and PR body drafted (not opened).

## Review focus items to keep in mind

1. Direct visit to `/campaigns/:slug/thanks` without paying: no donor data, no claim a donation exists.
2. Cancel at Stripe and return: notice shown and the donate form is usable.
3. Double-click on Publish or refresh after publishing: one transition, no error page, "pending approval" shown when approval mode is on.
4. Server render of the editor, dark-mode switch and toasts: no hydration warning, no flash of the wrong theme, no `window` access on the server.
5. Admin inbox with zero items and a double-clicked "resolve": empty state shows and the action applies once.

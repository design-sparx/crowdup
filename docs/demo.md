# Public demo instance

A demo runs on its own hosted Supabase project, in Stripe test mode, with seeded data that resets hourly. Nothing here has been run against real services yet: every step below is an operator task.

## What the code does

- `DEMO_MODE=true` shows a site-wide banner (demo, Stripe test mode, test card 4242 4242 4242 4242, data resets on a schedule). Off by default; never rendered when off.
- The banner only claims test mode if `STRIPE_SECRET_KEY` starts with `sk_test_` (or `rk_test_`). With `DEMO_MODE=true` and a live, missing or unrecognised key it shows a red warning instead and logs a server error. Use a test key.
- `supabase/demo-seed.sql` gives `admin@`, `amara@` (organiser) and `dana@` `crowdup.example` the password `demo-password-123`. These are public credentials, for the demo only. The file is not in `supabase/config.toml`, so `supabase db reset` and self-hosters never get it.
- `.github/workflows/demo-reset.yml` (hourly and manual) runs `scripts/demo-reset.mjs`, which wipes campaigns, donations, reports, moderation rows and auth users, then reapplies `seed.sql` and `demo-seed.sql` in one transaction (a failed seed rolls back).
- Stripe test data is not reset. Seeded `acct_test_*` ids are fake. Real Connect test accounts created by visitors stay in your Stripe test dashboard; clear them there if needed.

## What visitors cannot do

The seeded accounts and campaigns are shared, so with `DEMO_MODE=true` the server refuses ("This action is disabled in the public demo") the actions that would spoil the demo for the next visitor. Rules live in `src/lib/demo/guard.ts`:

- Changing or resetting a password (this would lock everyone out of the shared logins).
- Suspending or restoring users.
- Editing, closing, posting updates to, suspending, restoring, approving or rejecting the seeded campaigns (ids `10000000-0000-4000-8000-0000000000NN`).

Allowed: creating campaigns, Stripe test onboarding, donating, and moderating campaigns visitors create. The hourly reset removes anything left behind.

## Reset safety

`scripts/demo-reset-guard.mjs` (unit tested) refuses to run unless `DEMO_DATABASE_URL` is a hosted Supabase URL (direct `db.<ref>.supabase.co` or pooler `postgres.<ref>`) and its project ref equals `DEMO_RESET_CONFIRM_PROJECT_REF`. Local and non-Supabase URLs are refused. The workflow also does nothing unless the repository variable `DEMO_RESET_ENABLED` is `true`, so forks and real instances skip it. Never put a real instance's URL in these secrets.

## Demo site environment (Netlify)

```
SUPABASE_URL=<demo project url>
SUPABASE_ANON_KEY=<demo anon key>
SUPABASE_SERVICE_ROLE_KEY=<demo service role key>   # as in .env.example
SITE_URL=<demo site origin>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DEMO_MODE=true
PUBLISHING_MODE=auto
```

Check `.env.example` for any other required variable. `netlify.toml` is unchanged: all demo behaviour is env driven, so one build serves both.

## Operator steps

1. Create a new Supabase project (demo only). Note the project ref.
2. Apply migrations: `supabase link --project-ref <ref>` then `supabase db push`.
3. Auth > Sign In / Providers: turn off **Allow new users to sign up** (the demo uses seeded accounts only; the admin inbox warns if this is left on). Auth > Providers > Email: turn **Confirm email** off (hosted demo project only; it only matters if you also set `AUTH_SIGNUP_ENABLED=true` for the demo — by default the demo has no signup and visitors use the seeded accounts below). `supabase/config.toml` is untouched. Add the demo origin to Auth > URL Configuration.
4. Create a Netlify site from this repo and set the environment above (Stripe values after steps 5 and 6, then redeploy).
5. Stripe test mode: enable Connect, copy the `sk_test_` key.
6. Add a Connect webhook (test mode) pointing at `<demo origin>/api/stripe/webhook`; copy its `whsec_` secret. See `docs/stripe.md` for events.
7. GitHub repo secrets: `DEMO_DATABASE_URL` (the demo project's Postgres URL), `DEMO_RESET_CONFIRM_PROJECT_REF` (the ref). Variable: `DEMO_RESET_ENABLED=true`.
8. Run the "Reset demo database" workflow once (Actions > Run workflow) to load the seed. Log in as `amara@crowdup.example` / `demo-password-123`.
9. Replace the TODO line in README with the demo URL and set it as the repository website.

## Acceptance checklist (ticket 24)

| Criterion | Status |
| --- | --- |
| Deployed on Netlify with seeded data | Needs operator (steps 1-4, 8). Seed and reset built, unverified. |
| Stripe test mode and banner tells visitors to use test cards | Banner and key guard built, unit tested; live rendering unverified. Stripe setup needs operator (5-6). |
| Email confirmation off on demo only | Needs operator (step 3). Default config unchanged. |
| Data resets on a schedule | Workflow and guarded script built, unverified (needs step 7). |
| Demo URL in README and repo description | Needs operator (step 9); README has a TODO marker. |

Optional local use of the demo accounts for the dashboard e2e spec: after `supabase db reset`, run `psql postgresql://postgres:postgres@127.0.0.1:56322/postgres -f supabase/demo-seed.sql`, then `E2E_ORGANISER_PASSWORD=demo-password-123 pnpm test:e2e`. Not run here.

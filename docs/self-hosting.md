# Self-hosting guide

How to run your own CrowdUp: Supabase for data and auth, Stripe Connect for payments, Netlify for the server-rendered app.

> Status: this guide was written from the code and docs. It has **not** been followed end to end against a real Supabase project, Stripe account or Netlify site. Expect to correct small details, and please send fixes.

You will need: a Supabase project, a Stripe account in a country that supports Connect (see [Known limitations](../README.md#known-limitations)), a Netlify account, and this repository forked to your GitHub account. Do Supabase and Stripe first, then Netlify, because the app needs their values at run time.

## 1. Supabase project

1. Create a project at supabase.com. Note the project ref, the URL (`https://<ref>.supabase.co`), the anon key and the service role key (Project settings > API).
2. Apply the schema. With the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link --project-ref <ref>` then `supabase db push`. This applies everything in `supabase/migrations/` (tables, RLS policies, functions, the `campaign-covers` storage bucket).
3. Seed data is optional. `supabase/seed.sql` holds fake sample campaigns and users and is only loaded by `supabase db reset` locally. Do **not** load it on a real instance. Its users all share the local dev password `crowdup-local-dev`. `supabase/demo-seed.sql` is for the public demo only and sets public passwords.
4. Auth > URL Configuration: set **Site URL** to your `SITE_URL` and add `<SITE_URL>` and `<SITE_URL>/auth/callback` to **Redirect URLs**. A mismatch breaks email links and OAuth.
5. Auth > Providers > Email: keep **Confirm email** on for production. (`supabase/config.toml` turns it off for local development only.) It only matters while `AUTH_SIGNUP_ENABLED` is on; provisioned accounts are confirmed by the seed snippet below.
6. **Custom SMTP** is only needed if you turn on `AUTH_SIGNUP_ENABLED` (confirmation emails) or want self-service password-reset emails. Supabase's built-in mail sender is intended for testing, is heavily rate limited and only delivers to project team members; without your own SMTP (Auth > SMTP Settings) those emails will not reach ordinary users. CrowdUp itself sends no emails; these are all Supabase Auth emails. With signup off and resets handled by you, you can skip SMTP entirely.
7. Create the first users — see below. Signup is **disabled by default**: there is no public registration path, and Google sign-in only admits emails you have already provisioned. Leave it that way unless you want anyone to be able to register.

### Create the first users

CrowdUp has no public signup by default (`AUTH_SIGNUP_ENABLED=false`). You create accounts yourself, in one of two ways.

**Option A — SQL editor (works for several users at once).** In the Supabase SQL editor, paste the following once per user. Replace `<CHANGE-ME-UUID>` with a fresh UUID (for example from uuidgenerator.net), `<user@example.org>` with the person's email, their name, and `<CHANGE-ME-PASSWORD>` with a strong password they change after first login. The last line makes that user an administrator; drop it for ordinary organisers and donors.

```sql
-- Add one user. Repeat with new values for each person.
insert into auth.users (
  id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, email_confirmed_at
) values (
  '<CHANGE-ME-UUID>', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  '<user@example.org>', '{"provider":"email","providers":["email"]}',
  '{"full_name":"Their Name"}', now(), now(), now()
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       now(), now(), now()
from auth.users u where u.email = '<user@example.org>';

-- Administrator only:
update public.profile set role = 'admin' where id = '<CHANGE-ME-UUID>';
```

The profile row is created automatically by a database trigger when the user is inserted; roles cannot be set from the client, which is why the admin grant is a separate SQL statement.

**Option B — dashboard (one user at a time).** Authentication > Users > **Add user** (email, password, "Auto-confirm user" checked). The profile row appears via the same trigger; promoting to admin still needs the `update public.profile set role = 'admin' ...` statement above.

Either way, the person signs in at `/login` with their email and password. If you enable Google sign-in (next section), provisioned emails can also sign in with Google.

## 2. Google sign-in (optional)

Create an OAuth client in Google Cloud, add Supabase's callback URL (`https://<ref>.supabase.co/auth/v1/callback`) as an authorised redirect, then enable the Google provider in Supabase (Auth > Providers) with the client id and secret. Finally set `AUTH_GOOGLE_ENABLED=true` in the app. For local development, configure `[auth.external.google]` in `supabase/config.toml`. With `AUTH_SIGNUP_ENABLED=false` (the default), a Google account whose email you have not provisioned is refused at the callback — Google sign-in is an alternative way *in* for existing users, not a way to create accounts.

## 3. Stripe

Full detail in [stripe.md](stripe.md). Summary:

1. Start in **test mode**. Enable Connect (Standard accounts) in the dashboard. Without this, creating a connected account fails with `You can only create new accounts if you've signed up for Connect` (the dashboard shows the message next to the button).
2. Copy the secret key into `STRIPE_SECRET_KEY` (`sk_test_...`; switch to `sk_live_...` only when ready for real money).
3. After the site has a URL, create a **Connect** webhook (Events from connected accounts) at `<SITE_URL>/api/stripe/webhook` with events `account.updated`, `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Test and live mode have separate keys, webhooks and connected accounts. Going live means repeating steps 2 and 3 with live values and redeploying.

## 4. Netlify

1. Add a new site from your fork (or use the Deploy to Netlify button in the README). Build settings come from `netlify.toml`: build command `pnpm build`, publish directory `build/client`. Server rendering is generated by the `@netlify/vite-plugin-react-router` plugin, so no redirect rules are needed. Use a current Node LTS (CI uses 22).
2. Set the environment variables below (Site configuration > Environment variables). Mark the secrets as secret.
3. Deploy, then set the Supabase Site URL and the Stripe webhook to the final site URL. If you change `SITE_URL`, redeploy.
4. Smoke test: sign in as the admin account you created in step 1.7, create a campaign, connect a test Stripe account, donate with `4242 4242 4242 4242`, and check the donation appears (the webhook writes it).

## Environment variables

All variables are read on the server through `process.env` (loaders, actions, `src/root.tsx`). None use the `VITE_` prefix, so nothing is bundled into browser code. The list comes from a search of `src/`, `scripts/`, `e2e/` and the config files; `.env.example` is the template.

### Application

| Variable | Required | Default | Read in | Purpose |
| --- | --- | --- | --- | --- |
| `SUPABASE_URL` | Yes | none (throws) | `src/data-access/auth/authConfig.ts`, `src/lib/supabase/server-public.ts`, `src/data-access/stripe/serviceRole.server.ts` | Supabase project URL. |
| `SUPABASE_ANON_KEY` | Yes | none (throws) | `authConfig.ts`, `server-public.ts` | Anon (publishable) key; access is limited by row-level security. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for Stripe, publishing and donations | none (throws when used) | `src/data-access/stripe/serviceRole.server.ts` | Bypasses RLS. Used to store Stripe fields, publish drafts and record donations from webhooks. Server only. |
| `SITE_URL` | Yes in production | request origin outside production; in production it **throws** when Stripe or Checkout URLs are built | `authConfig.ts`, `connect.server.ts`, `checkout.server.ts` | Public origin (trailing slash stripped). Builds Stripe return/refresh and Checkout success/cancel URLs and auth redirects. |
| `STRIPE_SECRET_KEY` | Yes for payments | none (throws when used) | `src/data-access/stripe/stripe.server.ts`, `src/lib/demo/demo.ts` | Stripe secret key. |
| `STRIPE_WEBHOOK_SECRET` | Yes for webhooks | none (webhook is rejected) | `src/data-access/stripe/webhook.server.ts` | Signing secret of the Connect webhook endpoint. |
| `STRIPE_SUPPRESS_NOTICES` | No | unset | read by the `stripe` SDK | `true` hides Stripe's advisory notices (for example "We recommend building your integration using Accounts v2"). Useful in test/sandbox, never needed for live keys. |
| `CLIENT_IP_HEADER` | No | Netlify's header on Netlify, else none | `src/lib/reports/reports.ts` | Request header holding the real client IP for the guest report rate limit. See Security notes. |
| `PLATFORM_FEE_PERCENT` | No | `0` (no application fee sent) | `src/lib/donations/fee.ts` | Percentage of each donation, 0 to 30, up to 2 decimals. An invalid value makes checkout fail rather than guess. |
| `PUBLISHING_MODE` | No | `auto` | `src/data-access/stripe/connect.server.ts`, `src/lib/stripe/publishing.ts` | `auto` or `approval`. Anything else is an error. See [moderation.md](moderation.md). |
| `AUTH_GOOGLE_ENABLED` | No | `false` | `authConfig.ts` | `true` or `1` shows Google sign-in. The provider must also be enabled in Supabase. |
| `AUTH_SIGNUP_ENABLED` | No | `false` | `authConfig.ts` | `true` or `1` enables `/signup` and allows Google sign-in to create new accounts. Leave off and provision users as described in [Create the first users](#create-the-first-users). |
| `DEMO_MODE` | No | `false` | `src/lib/demo/demo.ts`, `src/root.tsx` | Shows the demo banner. Leave off for real instances. See [demo.md](demo.md). |
| `NODE_ENV` | Set by the runtime | `production` in built apps | `connect.server.ts`, `checkout.server.ts` | Only used to require `SITE_URL` in production. Do not set it by hand. |

### Demo reset, tests and tooling only (not needed by a normal deployment)

| Variable | Required | Default | Read in | Purpose |
| --- | --- | --- | --- | --- |
| `DEMO_DATABASE_URL` | Only for the demo reset workflow (GitHub secret) | none | `scripts/demo-reset.mjs`, `scripts/demo-reset-guard.mjs` | Postgres URL of the demo project. Never a real instance. |
| `DEMO_RESET_CONFIRM_PROJECT_REF` | Only for the demo reset (GitHub secret) | none | `scripts/demo-reset-guard.mjs` | Must equal the project ref in the URL or the reset refuses. |
| `PLAYWRIGHT_CHROMIUM_PATH` | No | Playwright's Chromium | `playwright.config.ts` | Use an existing Chromium. |
| `CI` | Set by CI | unset | `playwright.config.ts` | Enables retries and `forbidOnly`. |
| `E2E_ORGANISER_PASSWORD`, `E2E_DONOR_PASSWORD`, `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_LIVE_EDIT_URL`, `E2E_DONATE_CAMPAIGN_URL` | No | none | `e2e/*.spec.ts` | Credentials and URLs for specific browser specs. Local test use only. |

## Security notes

- **Service role key:** `SUPABASE_SERVICE_ROLE_KEY` bypasses all row-level security. Keep it in server environment variables only; never commit it, give it a `VITE_` prefix or paste it into client code. Rotate it if leaked.
- **`SITE_URL` behind proxies or custom domains:** Stripe redirects and Checkout return URLs are built only from `SITE_URL`, never from request headers. Set it to your canonical public origin (again after adding a custom domain) and keep it in Supabase's Redirect URLs.
- **`CLIENT_IP_HEADER`:** the guest report rate limit keys on the client address in this request header. Set it to the header your own proxy sets and overwrites (for example `x-real-ip`); a header a client can supply lets them dodge the limit. On Netlify it defaults to `x-nf-client-connection-ip`. With no trusted header all guests share one bucket, which is safe but strict. `X-Forwarded-For` is never used. The limiter is also in memory and per instance ([reports.md](reports.md)).
- **`PUBLISHING_MODE` semantics:** a per-deploy setting read by the app, not by the database. In both modes the database stops clients publishing, but the service role used by server code could still move a draft straight to `live` in approval mode if app code were wrong ([moderation.md](moderation.md)). Switching modes does not move existing campaigns.
- **Stripe keys:** use test keys until ready. A `DEMO_MODE=true` site with a live key shows a red warning by design.
- **Legal:** adapt the Terms, Privacy and Security pages before accepting real donations ([operators-legal.md](operators-legal.md)).
- Report vulnerabilities as described in [SECURITY.md](../SECURITY.md).

## Updating

Pull upstream changes into your fork, run `supabase db push` for new migrations before deploying code that needs them, then deploy. Check release notes for new environment variables.

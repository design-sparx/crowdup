# Stripe setup

CrowdUp uses Stripe Connect with **Standard** accounts. Each organiser connects their own Stripe account, so donations go straight to them and refunds and disputes stay in their account. The platform never holds funds.

## Configure (test mode first)

1. Create a Stripe account and stay in **test mode** (the dashboard toggle).
2. Enable Connect: Dashboard > Connect > Get started (platform, Standard accounts).
3. Copy the test secret key (`sk_test_...`) into `STRIPE_SECRET_KEY`.
4. Set `SITE_URL` to the public origin of the app (for example `http://localhost:5173`). Stripe's return and refresh links are built only from `SITE_URL`, never from request headers. It is required in production.
5. Set `SUPABASE_SERVICE_ROLE_KEY` (`supabase status` locally). It is server-only.
6. Webhook for onboarding status (optional but recommended): create an endpoint at `<SITE_URL>/api/stripe/webhook` listening to the Connect event `account.updated` ("Events from connected accounts"), and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Locally: `stripe listen --forward-connect-to localhost:5173/api/stripe/webhook`.

## How it works

- Dashboard > "Connect Stripe" (`POST /stripe/connect`) creates the connected account (once) and redirects to Stripe's hosted onboarding.
- Stripe returns to `/stripe/return`, which re-reads the account from Stripe (the redirect itself is not trusted), stores status and currency on the profile, and publishes the organiser's drafts. `/stripe/refresh` issues a fresh link when one expires.
- Onboarding counts as complete when `details_submitted`, `charges_enabled` and a `default_currency` are all present. The panel shows Connected, Incomplete or Not started, and why each campaign is or is not live.
- The `account.updated` webhook keeps this in sync if the organiser never comes back. It only identifies the account; status is re-read from Stripe, so replays are harmless.

## Currency and publishing design

- Drafts can be saved **before** connecting. A draft has no currency (the create form shows it as "set from your Stripe account").
- The currency is taken from the Stripe account when the campaign goes live and is then fixed (a database trigger rejects any later change, even from the service role). Clients cannot write currency at all.
- `PUBLISHING_MODE=auto` (default): drafts go live when onboarding completes, or when the connected organiser presses Publish on a draft.
- `PUBLISHING_MODE=approval`: drafts stay drafts. The `pending_approval` status and approval queue are not in the schema yet; ticket #22 adds them.

## Not built here

The donation checkout and the donation webhook belong to ticket #18. `verifyStripeWebhook` in `src/data-access/stripe/webhook.server.ts` verifies signatures on the raw body and is meant to be reused there.

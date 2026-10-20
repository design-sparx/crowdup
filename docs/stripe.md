# Stripe setup

CrowdUp uses Stripe Connect with **Standard** accounts. Each organiser connects their own Stripe account, so donations go straight to them and refunds and disputes stay in their account. The platform never holds funds.

## Configure (test mode first)

1. Create a Stripe account and stay in **test mode** (the dashboard toggle).
2. Enable Connect: Dashboard > Connect > Get started (platform, Standard accounts). Until this is done, `POST /stripe/connect` fails with `invalid_request_error: You can only create new accounts if you've signed up for Connect`, and the dashboard shows that message next to the button. You can also do it without the dashboard: Stripe CLI `stripe tools search enable_connect`, or the Stripe MCP `EnableConnect` tool.
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
- `PUBLISHING_MODE=approval`: drafts move to `pending_approval` (after onboarding, or on the Submit for approval button) and an administrator decides. See [moderation.md](moderation.md).

## Donations (ticket #18)

NOT RUN against real Stripe or a database: everything below is covered by unit tests with fakes and locally signed fixture events only.

- **Checkout**: the campaign page action (`intent=donate`) creates a Checkout Session as a **direct charge** on the organiser's connected account (`stripeAccount` option, i.e. the `Stripe-Account` header). It is refused server side unless the campaign passes `canAcceptDonations` and the organiser has a connected, onboarded, unsuspended account. Success and cancel URLs come from `SITE_URL` only. Guests and signed-in users both work; the signed-in id is stored in `donation.donor_user_id`.
- **Amounts**: 1 to 100,000 in major units of the campaign currency, converted to integer minor units with the currency's exponent (JPY 0, KWD 3, most others 2). Presets are 10, 25, 50, 100 or a custom amount.
- **Platform fee** (`PLATFORM_FEE_PERCENT`, default `0`, max 30, at most 2 decimals): percentage of the donation, in integer minor units, rounded half up. When the fee is 0, `application_fee_amount` is **not sent at all**. An invalid value fails checkout (fail closed) rather than guessing.
- **Metadata** on the session and PaymentIntent (keys `crowdup_*`: campaign id, anonymous flag, donor name, message, user id, fee), values truncated to Stripe's 500-character limit. The webhook treats it as untrusted: it checks the campaign exists, the event's connected account owns it, and the currency matches.
- **Webhook**: `checkout.session.completed` and `checkout.session.async_payment_succeeded` from connected accounts insert one `confirmed` donation, only when `payment_status` is `paid`. The unique `stripe_event_id` and `stripe_checkout_session_id` make duplicates and out-of-order replays a no-op that still returns 200. Unknown, unpaid or irrelevant events return 200 without writing. Database errors return 500 so Stripe retries.
- **Campaign not live when the payment completes**: the donation is still recorded and counted (the money already reached the organiser) and `donation.flagged_reason` is set for admin review.
- **Totals and donors**: only `confirmed` rows count (`campaign_totals`); the recent donors list reads `public_donation`, which hides name and message of anonymous donors. The success redirect writes nothing, so the total updates when the webhook lands.

### Unmatched payments

A paid session that cannot be tied to a campaign (unknown campaign id, the event's Stripe account is not the campaign owner's, or the currency differs) is acknowledged with 200, so Stripe does not retry, and written to `unmatched_payment`. It is never a donation and never in totals. The webhook route also logs it with `console.error`.

- **Review**: admins see open ones at `/admin/payments` (orange count badge in the admin header). Refund or reconcile the payment in the Stripe dashboard, then press Mark reviewed. The rows hold only Stripe ids, an amount, a currency and a reason, no donor personal data. A payment event with no usable currency is stored with `XXX` (ISO 4217 for "no currency").
- **Retention**: `prune_unmatched_payments()` (service role only) deletes rows reviewed more than a year ago and never touches open ones. Nothing schedules it; run it from a Supabase scheduled job if you want the cleanup, for example `select cron.schedule('prune-unmatched', '0 3 * * 0', 'select public.prune_unmatched_payments()')` with the `pg_cron` extension enabled.

### Webhook setup

One endpoint serves both onboarding and donations. In the Dashboard create an endpoint at `<SITE_URL>/api/stripe/webhook`, choose **Events from connected accounts**, and subscribe to `account.updated`, `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Its signing secret goes in `STRIPE_WEBHOOK_SECRET`. A Connect endpoint has its own secret, different from any platform ("Your account") endpoint; events from connected accounts are signed with the Connect endpoint's secret, which is the one to use here.

Local development:

```
stripe listen --forward-connect-to localhost:5173/api/stripe/webhook
```

(`--forward-connect-to` forwards connected-account events; plain `--forward-to` only forwards platform events.) Use the `whsec_...` it prints as `STRIPE_WEBHOOK_SECRET`.

### Test cards

`4242 4242 4242 4242` succeeds, `4000 0000 0000 9995` is declined (insufficient funds), `4000 0025 0000 3155` requires 3D Secure. Any future expiry, any CVC.

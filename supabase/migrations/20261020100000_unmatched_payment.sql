-- Payments the webhook could not attach to a campaign (unknown campaign, the event's Stripe
-- account is not the campaign owner's, or the currency differs). The money has already
-- moved on the connected account, so the event must not vanish: an operator reviews these
-- rows. They are never counted in totals and never shown publicly.
--
-- stripe_event_id is unique so a redelivered event is recorded once.

create table public.unmatched_payment (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_account_id text not null,
  campaign_id uuid,
  amount bigint not null check (amount > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  reason text not null check (char_length(reason) <= 200),
  created_at timestamptz not null default now()
);

alter table public.unmatched_payment enable row level security;

-- No policies: only the service role (which bypasses RLS) reads or writes this table.
revoke all on public.unmatched_payment from anon, authenticated;
grant all on public.unmatched_payment to service_role;

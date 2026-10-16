-- Donations, reports, and derived totals.
--
-- Donations are written only by the server (service role) from verified Stripe webhook
-- events. Clients have no write privileges at all. Duplicate webhook deliveries are
-- rejected by the unique stripe_event_id, so each event records at most one donation.

create table public.donation (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaign (id) on delete restrict,
  amount bigint not null check (amount > 0),
  fee_amount bigint not null default 0 check (fee_amount >= 0 and fee_amount <= amount),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  donor_name text check (char_length(donor_name) <= 120),
  donor_email text check (char_length(donor_email) <= 320),
  anonymous boolean not null default false,
  message text check (char_length(message) <= 500),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  -- Null until the webhook confirms the payment. The unique constraint makes webhook
  -- processing idempotent: a replayed event fails the insert and is treated as done.
  stripe_event_id text unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint donation_confirmed_has_event check (
    status <> 'confirmed' or (stripe_event_id is not null and confirmed_at is not null)
  )
);

create index donation_campaign_id_idx on public.donation (campaign_id, status);

alter table public.donation enable row level security;

-- No policies for anon or authenticated. Only the service role (which bypasses RLS)
-- writes donations, and clients read them only through public_donation below.
revoke all on public.donation from anon, authenticated;
grant all on public.donation to service_role;

-- Public donor list. Exposes the donor's name only when the donor did not choose to be
-- anonymous, and never exposes email, Stripe ids or non-confirmed donations. Visible
-- for live campaigns, to the campaign owner, and to admins. Because the view is owned by
-- postgres it bypasses donation RLS, so each row is filtered here explicitly.
create view public.public_donation
  with (security_barrier = true)
as
  select
    d.id,
    d.campaign_id,
    d.amount,
    d.currency,
    d.created_at,
    d.anonymous,
    case when d.anonymous then null else d.donor_name end as donor_name,
    case when d.anonymous then null else d.message end as message
  from public.donation d
  join public.campaign c on c.id = d.campaign_id
  where d.status = 'confirmed'
    and (c.status = 'live' or c.owner_id = auth.uid() or public.is_admin());

revoke all on public.public_donation from anon, authenticated;
grant select on public.public_donation to anon, authenticated;

-- Totals derived only from confirmed donations, for live campaigns. Clients cannot write
-- these; they are recomputed from donation rows on every read.
create view public.campaign_totals
  with (security_barrier = true)
as
  select
    c.id as campaign_id,
    coalesce(sum(d.amount) filter (where d.status = 'confirmed'), 0)::bigint as raised_amount,
    count(d.id) filter (where d.status = 'confirmed') as donor_count
  from public.campaign c
  left join public.donation d on d.campaign_id = c.id
  where c.status = 'live'
  group by c.id;

revoke all on public.campaign_totals from anon, authenticated;
grant select on public.campaign_totals to anon, authenticated;

-- Reports. Anyone can report a live campaign, including guests (reporter_id null).
-- Only admins read or triage them, and reporters cannot see reports, not even their own.
create table public.report (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaign (id) on delete cascade,
  reporter_id uuid references public.profile (id) on delete set null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  created_at timestamptz not null default now()
);

create index report_campaign_id_idx on public.report (campaign_id);
create index report_status_idx on public.report (status);

alter table public.report enable row level security;

create policy report_insert_public on public.report
  for insert to anon, authenticated
  with check (
    status = 'open'
    and (reporter_id is null or reporter_id = auth.uid())
    and exists (
      select 1 from public.campaign c
      where c.id = campaign_id and c.status = 'live'
    )
  );

create policy report_select_admin on public.report
  for select to authenticated
  using (public.is_admin());

create policy report_update_admin on public.report
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.report from anon, authenticated;
grant insert (campaign_id, reporter_id, reason) on public.report to anon, authenticated;
grant select on public.report to authenticated;
grant update (status) on public.report to authenticated;
grant all on public.report to service_role;

-- Stop clients from silently handing a report to someone else by changing its fields.
-- The column grants above already restrict writes; this trigger documents the rule.
create function public.guard_report_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.campaign_id is distinct from old.campaign_id
       or new.reporter_id is distinct from old.reporter_id
       or new.reason is distinct from old.reason then
      raise exception 'only the report status can change' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger report_guard_update
  before update on public.report
  for each row execute function public.guard_report_update();

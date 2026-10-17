-- Campaign lifecycle: automatic closing at the end date, and a donation guard.
--
-- Mechanism: the app derives an "ended" status at read time (src/lib/campaigns/lifecycle.ts),
-- so correctness never depends on a job running on time. This migration additionally
-- persists the state: close_expired_campaigns() moves live campaigns past their end date
-- to closed, and pg_cron runs it every 5 minutes where the extension is available.

create function public.close_expired_campaigns()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  -- Runs as the function owner, so guard_campaign_write treats it as a server write.
  update public.campaign
     set status = 'closed'
   where status = 'live'
     and end_date is not null
     and end_date <= now();
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.close_expired_campaigns() from public, anon, authenticated;
grant execute on function public.close_expired_campaigns() to service_role;

-- Schedule it when pg_cron can be enabled (hosted Supabase and the local image). If it
-- cannot, the read-time rule still blocks donations and shows "ended"; run the function
-- from any scheduler to persist the closed state.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('close-expired-campaigns', '*/5 * * * *', 'select public.close_expired_campaigns()');
exception when others then
  raise notice 'pg_cron unavailable (%); expired campaigns are only closed at read time', sqlerrm;
end;
$$;

-- Donation guard, consistent with canAcceptDonations: a new pending donation (a checkout
-- being started) is only allowed on a live campaign that has not passed its end date. The
-- funding goal is not a cap. Confirmed rows are not blocked: they record a payment the
-- donor already completed, even if the campaign closed while they were paying.
create function public.guard_donation_campaign()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'pending' and not exists (
    select 1 from public.campaign c
    where c.id = new.campaign_id
      and c.status = 'live'
      and (c.end_date is null or c.end_date > now())
  ) then
    raise exception 'this campaign is not accepting donations' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger donation_guard_campaign
  before insert on public.donation
  for each row execute function public.guard_donation_campaign();

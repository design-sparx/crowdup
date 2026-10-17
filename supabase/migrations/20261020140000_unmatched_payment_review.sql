-- Admins review unmatched payments (money that arrived at a connected account but could not
-- be tied to a campaign). They can read the rows and mark them reviewed; nothing else.
-- The rows hold no donor personal data: Stripe ids, an amount, a currency and a reason.
--
-- Retention: reviewed rows older than a year are deleted by prune_unmatched_payments(), so
-- a connected account cannot grow the table without bound. Open rows are never pruned.

alter table public.unmatched_payment add column resolved_at timestamptz;
create index unmatched_payment_open_idx on public.unmatched_payment (created_at) where resolved_at is null;

create policy unmatched_payment_select_admin on public.unmatched_payment
  for select to authenticated
  using (public.is_admin());

create policy unmatched_payment_update_admin on public.unmatched_payment
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.unmatched_payment to authenticated;
grant update (resolved_at) on public.unmatched_payment to authenticated;

create function public.prune_unmatched_payments()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  delete from public.unmatched_payment
   where resolved_at is not null and resolved_at < now() - interval '1 year';
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.prune_unmatched_payments() from public, anon, authenticated;
grant execute on function public.prune_unmatched_payments() to service_role;

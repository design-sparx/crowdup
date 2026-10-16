-- Admin approval mode (ticket 22): pending_approval and rejected statuses.
--
-- How the database learns the publishing mode: it does not, by design. PUBLISHING_MODE is a
-- per-deploy server setting (the app decides whether to submit a draft for approval or take
-- it live). What the database guarantees in BOTH modes is the part that must never depend on
-- app code:
--   * a client (anon/authenticated) can never move a campaign into live or pending_approval,
--     so an owner cannot self-publish or self-submit;
--   * pending_approval -> live happens only through approve_campaign(), which checks
--     is_admin() itself, and pending_approval -> rejected only through reject_campaign();
--   * live can only be entered from draft (server), pending_approval (admin), or restored by
--     an admin; pending_approval is only entered from draft, rejected only from pending.
-- A bug in the app (service-role code) could still publish a draft directly in approval mode;
-- that is the one thing mode-awareness in the database would add, and it was judged not worth
-- a settings table. Documented in docs/moderation.md.

alter table public.campaign drop constraint campaign_status_check;
alter table public.campaign add constraint campaign_status_check
  check (status in ('draft', 'pending_approval', 'rejected', 'live', 'closed', 'suspended'));

-- Pending and rejected campaigns have not been published yet.
alter table public.campaign drop constraint campaign_published_at_matches_status;
alter table public.campaign add constraint campaign_published_at_matches_status
  check (status in ('draft', 'pending_approval', 'rejected') or published_at is not null);

-- Why an administrator rejected the campaign. Written only by reject_campaign() (no client
-- update grant); cleared on resubmission and approval.
alter table public.campaign
  add column rejection_reason text check (rejection_reason is null or char_length(rejection_reason) between 3 and 1000);

-- Single source of truth for allowed status changes (TypeScript twin:
-- src/lib/campaigns/transitions.ts). actor is 'owner' (a client) or 'server'.
create function public.campaign_status_transition_allowed(actor text, from_status text, to_status text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when from_status = to_status then true
    when actor = 'owner' then (from_status, to_status) in (('live', 'closed'), ('rejected', 'draft'))
    when to_status = 'pending_approval' then from_status = 'draft'
    when to_status = 'rejected' then from_status = 'pending_approval'
    else true
  end;
$$;

create or replace function public.guard_campaign_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- The currency is fixed once set, for every role.
  if tg_op = 'UPDATE' and old.currency is not null and new.currency is distinct from old.currency then
    raise exception 'campaign currency cannot be changed' using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    -- Moderation entry rules hold for every role, including the service role and admins.
    if not public.campaign_status_transition_allowed(
         case when current_user in ('anon', 'authenticated') and not public.is_admin() then 'owner' else 'server' end,
         old.status, new.status) then
      raise exception 'campaign status cannot move from % to %', old.status, new.status using errcode = '42501';
    end if;
    -- A new submission starts clean.
    if new.status = 'pending_approval' then
      new.rejection_reason := null;
    end if;
  end if;

  if current_user not in ('anon', 'authenticated') then
    if tg_op = 'UPDATE' then
      new.updated_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.published_at is not null or new.rejection_reason is not null then
      raise exception 'new campaigns must start as drafts' using errcode = '42501';
    end if;
    new.updated_at := now();
    return new;
  end if;

  -- UPDATE by a client. Admins may change anything else.
  if public.is_admin() then
    new.updated_at := now();
    return new;
  end if;

  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.currency is distinct from old.currency
     or new.created_at is distinct from old.created_at
     or new.published_at is distinct from old.published_at
     or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'this campaign field cannot be changed' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

-- Owners cannot edit while a campaign waits for review (what is approved is what goes live).
drop policy campaign_update_owner on public.campaign;
create policy campaign_update_owner on public.campaign
  for update to authenticated
  using (owner_id = auth.uid() and status not in ('suspended', 'pending_approval') and public.is_active_user())
  with check (owner_id = auth.uid() and status not in ('suspended', 'pending_approval') and public.is_active_user());

-- Approve: pending_approval -> live. Admin only, checked inside the function.
create function public.approve_campaign(p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'only administrators can approve campaigns' using errcode = '42501';
  end if;
  update public.campaign
     set status = 'live', published_at = now(), rejection_reason = null
   where id = p_campaign_id and status = 'pending_approval';
  if not found then
    raise exception 'campaign is not pending approval' using errcode = 'P0002';
  end if;
end;
$$;

-- Reject: pending_approval -> rejected with a required reason. Admin only.
create function public.reject_campaign(p_campaign_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reason text := btrim(coalesce(p_reason, ''));
begin
  if not public.is_admin() then
    raise exception 'only administrators can reject campaigns' using errcode = '42501';
  end if;
  if char_length(reason) not between 3 and 1000 then
    raise exception 'a rejection reason of 3 to 1000 characters is required' using errcode = '23514';
  end if;
  update public.campaign
     set status = 'rejected', rejection_reason = reason
   where id = p_campaign_id and status = 'pending_approval';
  if not found then
    raise exception 'campaign is not pending approval' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.approve_campaign(uuid) from public, anon;
revoke all on function public.reject_campaign(uuid, text) from public, anon;
grant execute on function public.approve_campaign(uuid) to authenticated, service_role;
grant execute on function public.reject_campaign(uuid, text) to authenticated, service_role;

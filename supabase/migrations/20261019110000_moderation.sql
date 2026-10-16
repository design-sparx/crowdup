-- Admin moderation: suspend/restore campaigns, suspend/unsuspend users, with an audit trail.
--
-- Design: every action is a SECURITY DEFINER function restricted to is_admin(). It changes
-- state and writes the moderation_action row in one transaction, so there is no state
-- change without an audit row. The functions run as the table owner, so the write guard
-- triggers (which only restrict anon/authenticated) let them through. Two extra triggers
-- stop clients, admins included, from changing suspension fields directly, so the
-- functions are the only client-reachable path. All functions pin search_path to ''.
--
-- Restore rule: suspending stores the prior status in campaign.suspended_from_status
-- (only live or closed campaigns can be suspended: drafts are private). Restore returns the
-- campaign to that status. A live campaign whose end date passed meanwhile is restored as
-- live and shows as ended at read time. A suspended row with no stored prior status (seed
-- data) is restored to closed.

alter table public.campaign
  add column suspended_reason text check (suspended_reason is null or char_length(suspended_reason) between 3 and 1000),
  add column suspended_from_status text check (suspended_from_status in ('live', 'closed')),
  add column suspended_at timestamptz;

alter table public.profile
  add column suspended_reason text check (suspended_reason is null or char_length(suspended_reason) between 3 and 1000);

create table public.moderation_action (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profile (id) on delete restrict,
  action text not null check (action in ('campaign_suspended', 'campaign_restored', 'user_suspended', 'user_unsuspended')),
  target_type text not null check (target_type in ('campaign', 'user')),
  target_id uuid not null,
  reason text check (reason is null or char_length(reason) between 3 and 1000),
  created_at timestamptz not null default now(),
  constraint moderation_suspend_needs_reason check (
    action not in ('campaign_suspended', 'user_suspended') or reason is not null
  ),
  constraint moderation_target_matches_action check (
    (action like 'campaign\_%') = (target_type = 'campaign')
  )
);

create index moderation_action_target_idx on public.moderation_action (target_type, target_id, created_at);

alter table public.moderation_action enable row level security;

revoke all on public.moderation_action from anon, authenticated;
grant select on public.moderation_action to authenticated;
grant all on public.moderation_action to service_role;

create policy moderation_action_select_admin on public.moderation_action
  for select to authenticated
  using (public.is_admin());

-- Clients (admins included) cannot touch suspension state directly; only the functions
-- below (running as the owner) and the service role can.
create function public.guard_campaign_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and (
       (new.status is distinct from old.status and (new.status = 'suspended' or old.status = 'suspended'))
       or new.suspended_reason is distinct from old.suspended_reason
       or new.suspended_from_status is distinct from old.suspended_from_status
       or new.suspended_at is distinct from old.suspended_at
     ) then
    raise exception 'campaigns are suspended and restored through the moderation functions' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger campaign_guard_moderation
  before update on public.campaign
  for each row execute function public.guard_campaign_moderation();

create function public.guard_profile_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and (
       new.suspended is distinct from old.suspended
       or new.suspended_reason is distinct from old.suspended_reason
     ) then
    raise exception 'users are suspended through the moderation functions' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profile_guard_moderation
  before update on public.profile
  for each row execute function public.guard_profile_moderation();

create function public.admin_suspend_campaign(p_campaign_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := btrim(coalesce(p_reason, ''));
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  if char_length(v_reason) not between 3 and 1000 then
    raise exception 'a reason of 3 to 1000 characters is required' using errcode = '23514';
  end if;
  select status into v_status from public.campaign where id = p_campaign_id for update;
  if v_status is null then
    raise exception 'campaign not found' using errcode = 'P0002';
  end if;
  if v_status not in ('live', 'closed') then
    raise exception 'only live or closed campaigns can be suspended' using errcode = '23514';
  end if;
  update public.campaign
     set status = 'suspended', suspended_from_status = v_status,
         suspended_reason = v_reason, suspended_at = now()
   where id = p_campaign_id;
  insert into public.moderation_action (admin_id, action, target_type, target_id, reason)
  values (auth.uid(), 'campaign_suspended', 'campaign', p_campaign_id, v_reason);
end;
$$;

create function public.admin_restore_campaign(p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_prior text;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  select status, suspended_from_status into v_status, v_prior
    from public.campaign where id = p_campaign_id for update;
  if v_status is null then
    raise exception 'campaign not found' using errcode = 'P0002';
  end if;
  if v_status <> 'suspended' then
    raise exception 'campaign is not suspended' using errcode = '23514';
  end if;
  update public.campaign
     set status = coalesce(v_prior, 'closed'), suspended_from_status = null,
         suspended_reason = null, suspended_at = null
   where id = p_campaign_id;
  insert into public.moderation_action (admin_id, action, target_type, target_id)
  values (auth.uid(), 'campaign_restored', 'campaign', p_campaign_id);
end;
$$;

create function public.admin_suspend_user(p_user_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := btrim(coalesce(p_reason, ''));
  n integer;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'admins cannot suspend themselves' using errcode = '23514';
  end if;
  if char_length(v_reason) not between 3 and 1000 then
    raise exception 'a reason of 3 to 1000 characters is required' using errcode = '23514';
  end if;
  update public.profile set suspended = true, suspended_reason = v_reason
   where id = p_user_id;
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'user not found' using errcode = 'P0002';
  end if;
  insert into public.moderation_action (admin_id, action, target_type, target_id, reason)
  values (auth.uid(), 'user_suspended', 'user', p_user_id, v_reason);
end;
$$;

create function public.admin_unsuspend_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  update public.profile set suspended = false, suspended_reason = null
   where id = p_user_id and suspended;
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'user not found or not suspended' using errcode = 'P0002';
  end if;
  insert into public.moderation_action (admin_id, action, target_type, target_id)
  values (auth.uid(), 'user_unsuspended', 'user', p_user_id);
end;
$$;

revoke all on function public.admin_suspend_campaign(uuid, text) from public, anon;
revoke all on function public.admin_restore_campaign(uuid) from public, anon;
revoke all on function public.admin_suspend_user(uuid, text) from public, anon;
revoke all on function public.admin_unsuspend_user(uuid) from public, anon;
-- authenticated may call them; each function rejects non-admins itself.
grant execute on function public.admin_suspend_campaign(uuid, text) to authenticated, service_role;
grant execute on function public.admin_restore_campaign(uuid) to authenticated, service_role;
grant execute on function public.admin_suspend_user(uuid, text) to authenticated, service_role;
grant execute on function public.admin_unsuspend_user(uuid) to authenticated, service_role;

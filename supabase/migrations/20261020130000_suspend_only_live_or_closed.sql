-- The documented rule, the TypeScript twin and admin_suspend_campaign all say only live or
-- closed campaigns can be suspended, but campaign_status_transition_allowed still allowed
-- any status -> suspended for the server and admins. Close the gap so the single source of
-- truth matches: a pending, rejected or draft campaign is rejected or left alone, never
-- suspended, so restore (which returns to the prior status) always has a valid target.

create or replace function public.campaign_status_transition_allowed(actor text, from_status text, to_status text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when from_status = to_status then true
    when actor = 'owner' then (from_status, to_status) in (('live', 'closed'), ('rejected', 'draft'))
    when to_status = 'pending_approval' then from_status in ('draft', 'live')
    when to_status = 'rejected' then from_status = 'pending_approval'
    when to_status = 'suspended' then from_status in ('live', 'closed')
    else true
  end;
$$;

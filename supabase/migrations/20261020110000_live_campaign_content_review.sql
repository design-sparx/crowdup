-- Editing a live campaign must not bypass review.
--
-- Before this migration an owner could change the title, summary, story or cover of a live
-- campaign directly, so in approval mode "what is approved is what goes live" did not hold.
--
--   * A client (anon/authenticated, not an admin) can no longer change a live campaign's
--     public content. The server applies such edits with the service role after checking
--     ownership, and in approval mode moves the campaign back to pending_approval in the
--     same UPDATE (the database does not know the publishing mode, see the approval
--     migration). Goal and end date stay client-editable.
--   * live -> pending_approval is now allowed for the server and admins, never for clients.

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

  -- Public content of a live campaign is what was approved: changing it is a server action.
  if old.status = 'live' and (
       new.title is distinct from old.title
       or new.slug is distinct from old.slug
       or new.category is distinct from old.category
       or new.country is distinct from old.country
       or new.description is distinct from old.description
       or new.cover_image_url is distinct from old.cover_image_url
       or new.story is distinct from old.story
     ) then
    raise exception 'the content of a live campaign cannot be edited directly' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

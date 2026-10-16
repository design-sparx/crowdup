-- Campaigns and campaign updates.
--
-- Lifecycle: draft -> live -> closed, with suspended set by admins from any state.
-- Clients can only create drafts, edit content, and move live -> closed. Publishing
-- (draft -> live), restoring, and suspending are server or admin actions.

create table public.campaign (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profile (id) on delete restrict,
  title text not null check (char_length(title) between 3 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (char_length(category) between 1 and 64),
  country char(2) not null check (country ~ '^[A-Z]{2}$'),
  cover_image_url text,
  description text not null default '' check (char_length(description) <= 300),
  goal_amount bigint not null check (goal_amount > 0),
  -- ISO 4217 code of the organiser's Stripe account. Fixed after creation.
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  end_date timestamptz,
  story jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'live', 'closed', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint campaign_published_at_matches_status check (
    (status = 'draft') or (published_at is not null)
  )
);

create index campaign_owner_id_idx on public.campaign (owner_id);
create index campaign_status_idx on public.campaign (status);

alter table public.campaign enable row level security;

create table public.campaign_update (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaign (id) on delete cascade,
  author_id uuid not null references public.profile (id) on delete restrict,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index campaign_update_campaign_id_idx on public.campaign_update (campaign_id, created_at);

alter table public.campaign_update enable row level security;

-- Guards for client writes. Server and admin roles bypass these checks through
-- current_user, so the service role and migrations are unaffected.
create function public.guard_campaign_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    if tg_op = 'UPDATE' then
      new.updated_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.published_at is not null then
      raise exception 'new campaigns must start as drafts' using errcode = '42501';
    end if;
    new.updated_at := now();
    return new;
  end if;

  -- UPDATE by a client. Admins may change anything.
  if public.is_admin() then
    new.updated_at := now();
    return new;
  end if;

  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.currency is distinct from old.currency
     or new.created_at is distinct from old.created_at
     or new.published_at is distinct from old.published_at then
    raise exception 'this campaign field cannot be changed' using errcode = '42501';
  end if;

  if new.status is distinct from old.status
     and not (old.status = 'live' and new.status = 'closed') then
    raise exception 'campaign status can only move from live to closed' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger campaign_guard_write
  before insert or update on public.campaign
  for each row execute function public.guard_campaign_write();

-- Clients see live campaigns. Owners see their own campaigns in every state, except
-- they cannot edit suspended ones, and suspended owners cannot write at all.
create policy campaign_select_public on public.campaign
  for select to anon, authenticated
  using (status = 'live');

create policy campaign_select_owner on public.campaign
  for select to authenticated
  using (owner_id = auth.uid());

create policy campaign_select_admin on public.campaign
  for select to authenticated
  using (public.is_admin());

create policy campaign_insert_owner on public.campaign
  for insert to authenticated
  with check (owner_id = auth.uid() and public.is_active_user());

create policy campaign_update_owner on public.campaign
  for update to authenticated
  using (owner_id = auth.uid() and status <> 'suspended' and public.is_active_user())
  with check (owner_id = auth.uid() and status <> 'suspended' and public.is_active_user());

create policy campaign_update_admin on public.campaign
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.campaign from anon, authenticated;
grant select on public.campaign to anon, authenticated;
grant insert (owner_id, title, slug, category, country, cover_image_url, description,
              goal_amount, currency, end_date, story)
  on public.campaign to authenticated;
grant update (title, slug, category, country, cover_image_url, description, goal_amount,
              end_date, story, status)
  on public.campaign to authenticated;
grant all on public.campaign to service_role;

-- Updates posted by campaign owners.
create policy campaign_update_select_public on public.campaign_update
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.campaign c
      where c.id = campaign_id and c.status = 'live'
    )
  );

create policy campaign_update_select_owner on public.campaign_update
  for select to authenticated
  using (
    exists (
      select 1 from public.campaign c
      where c.id = campaign_id and c.owner_id = auth.uid()
    )
  );

create policy campaign_update_insert_owner on public.campaign_update
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_user()
    and exists (
      select 1 from public.campaign c
      where c.id = campaign_id and c.owner_id = auth.uid() and c.status in ('live', 'closed')
    )
  );

create policy campaign_update_delete_owner on public.campaign_update
  for delete to authenticated
  using (
    public.is_active_user()
    and exists (
      select 1 from public.campaign c
      where c.id = campaign_id and c.owner_id = auth.uid()
    )
  );

revoke all on public.campaign_update from anon, authenticated;
grant select on public.campaign_update to anon, authenticated;
grant insert (campaign_id, author_id, body) on public.campaign_update to authenticated;
grant delete on public.campaign_update to authenticated;
grant all on public.campaign_update to service_role;

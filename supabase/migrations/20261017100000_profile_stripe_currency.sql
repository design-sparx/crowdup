-- Currency of the organiser's connected Stripe account (ISO 4217, upper case).
-- Written only by the server (service role) when it syncs Stripe onboarding status.
-- No client update grant covers this column, so the existing column grants already
-- block clients; the permission tests assert it.

alter table public.profile
  add column stripe_currency char(3) check (stripe_currency ~ '^[A-Z]{3}$');

-- Campaign currency is taken from the organiser's Stripe account when the campaign goes
-- live, so a draft created before onboarding has no currency yet. Once set it never
-- changes (enforced below for every role, including the service role).
alter table public.campaign alter column currency drop not null;
alter table public.campaign
  add constraint campaign_currency_required_when_published check (status = 'draft' or currency is not null);

-- Clients can no longer choose a currency at creation; the server sets it at go-live.
revoke insert on public.campaign from authenticated;
grant insert (owner_id, title, slug, category, country, cover_image_url, description,
              goal_amount, end_date, story)
  on public.campaign to authenticated;

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

  -- UPDATE by a client. Admins may change anything else.
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

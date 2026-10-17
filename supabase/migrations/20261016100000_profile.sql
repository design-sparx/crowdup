-- Profile: one row per auth user. Holds the role and suspension flag that RLS relies on.
-- Clients may change display name and avatar. Role and suspension may be changed only by
-- admins, and Stripe fields only by the server (service role). Enforced by column grants
-- plus the guard trigger below, so a policy mistake alone cannot escalate privileges.

create table public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  suspended boolean not null default false,
  stripe_account_id text unique,
  stripe_onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile enable row level security;

-- Helpers are security definer so policies can call them without recursing into
-- profile's own RLS. The empty search_path forces fully qualified names.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profile p
    where p.id = auth.uid() and p.role = 'admin' and not p.suspended
  );
$$;

create function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profile p
    where p.id = auth.uid() and not p.suspended
  );
$$;

-- Both return false for anon. anon still needs execute because the public views call
-- is_admin() as the invoking role.
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_active_user() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_active_user() to anon, authenticated, service_role;

-- Creates a profile for every new auth user. The role is never read from user metadata,
-- so a sign-up request cannot choose its own role.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), ''), 80)
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.id is distinct from old.id then
      raise exception 'profile id cannot change' using errcode = '42501';
    end if;
    if (new.role is distinct from old.role or new.suspended is distinct from old.suspended)
       and not public.is_admin() then
      raise exception 'only admins can change roles or suspension' using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profile_guard_update
  before update on public.profile
  for each row execute function public.guard_profile_update();

-- Start from nothing, then grant only what each role needs.
revoke all on public.profile from anon, authenticated;
grant select on public.profile to authenticated;
grant update (display_name, avatar_url, role, suspended) on public.profile to authenticated;
grant all on public.profile to service_role;

create policy profile_select_own_or_admin on public.profile
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profile_update_own on public.profile
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profile_update_admin on public.profile
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Public, non-sensitive projection of profiles for campaign pages. The view is owned by
-- postgres (not security_invoker), so it exposes only these three columns and bypasses
-- profile RLS for them.
create view public.public_profile as
  select id, display_name, avatar_url from public.profile;

-- Supabase default privileges grant full DML on new views. This view is auto-updatable,
-- and the owner bypasses profile RLS, so writes through it must be revoked explicitly.
revoke all on public.public_profile from anon, authenticated;
grant select on public.public_profile to anon, authenticated;

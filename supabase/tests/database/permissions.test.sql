-- Permission tests for the CrowdUp schema, run with pgTAP through `supabase test db`.
--
-- These tests run against the seeded database (supabase/seed.sql), so run them after a
-- reset: `pnpm test:db` does both. Each test switches role and JWT claims, runs the
-- statement, and asserts the outcome. Denials are checked by SQLSTATE: 42501 for
-- insufficient privilege or RLS violations, 23505 for unique violations and 23514 for
-- check violations. Filtered-out rows (RLS) are checked by row count. Everything runs in
-- one transaction that is rolled back at the end, so the tests leave no changes behind.
--
-- Why pgTAP: it is bundled with the Supabase Postgres image and `supabase test db` runs it
-- natively, so no extra tooling is needed. Plain SQL assertions would need a custom runner.

begin;

select plan(64);

-- Helpers, scoped to this session.

-- Switch to a role and JWT subject. Always resets first so the switch works from any role.
-- Pass a null uid for anonymous requests.
create function pg_temp.become(uid uuid, r text) returns void
language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', r)::text, true);
  perform set_config('request.jwt.claim.sub', coalesce(uid::text, ''), true);
  execute format('set local role %I', r);
end;
$$;

-- Returns the SQLSTATE raised by a statement, or null if it succeeds.
create function pg_temp.sqlstate_of(stmt text) returns text
language plpgsql as $$
begin
  execute stmt;
  return null;
exception when others then
  return sqlstate;
end;
$$;

-- Returns the number of rows a write affects (0 when RLS filters the row out).
create function pg_temp.affected(stmt text) returns int
language plpgsql as $$
declare
  n int;
begin
  execute stmt;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Fixture ids from supabase/seed.sql.
-- Users: admin, amara (organiser, live campaigns), liam (organiser, closed and live),
-- sam (suspended organiser), dana (donor).
-- Campaigns: c1 live (amara), c2 live (amara, no donations), c3 draft (amara),
-- c4 live (liam), c5 closed (liam), c6 suspended (sam).

-- Schema defaults: default-deny RLS.

select is(
  (select count(*)::int from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0,
  'every public table has row-level security enabled'
);

-- Seed sanity.


select is((select count(*)::int from public.campaign), 6, 'seed creates six campaigns');
select is((select count(*)::int from public.donation where status = 'confirmed'), 7,
  'seed creates seven confirmed donations');
select is(
  (select raised_amount from public.campaign_totals where campaign_id = '10000000-0000-4000-8000-000000000001'),
  40000::bigint,
  'totals count only confirmed donations (pending and failed excluded)'
);

-- Anonymous visitors.

select pg_temp.become(null, 'anon');

select is((select count(*)::int from public.campaign), 3, 'anon reads only live campaigns');
select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  0,
  'anon cannot read a draft campaign'
);
select is(
  (select count(*)::int from public.campaign
     where id in ('10000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000006')),
  0,
  'anon cannot read closed or suspended campaigns'
);
select is(
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount, currency)
    values ('00000000-0000-4000-8000-000000000005', 'Anon campaign', 'anon-campaign', 'Other', 'KE', 100, 'KES')$$),
  '42501',
  'anon cannot create a campaign'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set title = 'Hacked' where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'anon cannot edit a campaign'
);
select is(
  pg_temp.sqlstate_of('select count(*) from public.donation'),
  '42501',
  'anon cannot read the donation table'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status)
    values ('10000000-0000-4000-8000-000000000001', 100, 'KES', 'pending')$$),
  '42501',
  'anon cannot write donations'
);
select is((select count(*)::int from public.public_donation), 5,
  'anon sees confirmed donations on live campaigns only');
select is(
  (select count(*)::int from public.public_donation where anonymous and donor_name is not null),
  0,
  'anonymous donors are not identified in the public donor list'
);
select is(
  (select count(*)::int from public.public_donation where donor_name is not null),
  3,
  'named donors are visible in the public donor list'
);
select is(
  (select count(*)::int from public.public_donation where donor_name = 'Pending Payer' or donor_name = 'Failed Card'),
  0,
  'pending and failed donations are not in the public donor list'
);
select is(
  (select donor_count from public.campaign_totals where campaign_id = '10000000-0000-4000-8000-000000000001'),
  3::bigint,
  'anon sees donor counts from confirmed donations'
);
select is(
  (select count(*)::int from public.campaign_totals where campaign_id = '10000000-0000-4000-8000-000000000005'),
  0,
  'anon sees no totals for closed campaigns'
);
select is(
  pg_temp.sqlstate_of($$insert into public.report (campaign_id, reason)
    values ('10000000-0000-4000-8000-000000000003', 'Drafts should not be reportable')$$),
  '42501',
  'anon cannot report a campaign that is not live'
);
select is(
  pg_temp.sqlstate_of('select count(*) from public.report'),
  '42501',
  'anon cannot read reports'
);
select is(
  pg_temp.sqlstate_of('select count(*) from public.profile'),
  '42501',
  'anon cannot read profiles'
);
select is((select count(*)::int from public.public_profile), 5,
  'anon can read the public profile projection');
select is(
  pg_temp.sqlstate_of($$update public.public_profile set display_name = 'Hacked'$$),
  '42501',
  'anon cannot write through the public profile view'
);

-- Organiser (owner). Amara owns c1, c2 and c3.

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');

select is((select count(*)::int from public.campaign), 4,
  'owner sees their own campaigns in every state plus other live campaigns');
select is(
  (select count(*)::int from public.campaign where owner_id = '00000000-0000-4000-8000-000000000002'),
  3,
  'owner sees all three of their campaigns, including the draft'
);
select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000006'),
  0,
  'owner cannot read another organiser''s suspended campaign'
);
select is(
  pg_temp.affected($$update public.campaign set title = 'Clean water for Kibera schools (updated)'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  1,
  'owner can edit their own campaign'
);
select is(
  pg_temp.affected($$update public.campaign set title = 'Hijacked'
    where id = '10000000-0000-4000-8000-000000000004'$$),
  0,
  'owner cannot edit another organiser''s campaign'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set owner_id = '00000000-0000-4000-8000-000000000003'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'owner cannot transfer a campaign to another owner'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'suspended'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'owner cannot suspend their own campaign'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'live'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  '42501',
  'owner cannot publish a draft directly (server publishes after Stripe onboarding)'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set currency = 'USD'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'owner cannot change the campaign currency'
);
select is(
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount, currency, status)
    values ('00000000-0000-4000-8000-000000000002', 'Pre-live', 'pre-live', 'Other', 'KE', 100, 'KES', 'live')$$),
  '42501',
  'owner cannot create a campaign that starts live'
);
select is(
  pg_temp.affected($$insert into public.campaign_update (campaign_id, author_id, body)
    values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Update posted by owner')$$),
  1,
  'owner can post an update on their live campaign'
);
select is(
  pg_temp.sqlstate_of($$insert into public.campaign_update (campaign_id, author_id, body)
    values ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000002', 'Not my campaign')$$),
  '42501',
  'owner cannot post an update on another organiser''s campaign'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status)
    values ('10000000-0000-4000-8000-000000000001', 100, 'KES', 'confirmed')$$),
  '42501',
  'owner cannot write donations to their own campaign'
);
select is(
  pg_temp.sqlstate_of($$update public.donation set status = 'refunded'$$),
  '42501',
  'owner cannot change donation status'
);
select is(
  (select count(*)::int from public.report),
  0,
  'owner cannot read reports'
);
select is(
  (select count(*)::int from public.profile where id = '00000000-0000-4000-8000-000000000002'),
  1,
  'owner can read their own profile'
);
select is(
  (select count(*)::int from public.profile where id = '00000000-0000-4000-8000-000000000003'),
  0,
  'owner cannot read another user''s profile'
);

-- Donor with a normal account.

select pg_temp.become('00000000-0000-4000-8000-000000000005', 'authenticated');

select is(
  pg_temp.sqlstate_of($$update public.profile set role = 'admin'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  '42501',
  'a user cannot grant themselves the admin role'
);
select is(
  pg_temp.sqlstate_of($$update public.profile set suspended = false
    where id = '00000000-0000-4000-8000-000000000005'$$),
  '42501',
  'a user cannot change their own suspension flag'
);
select is(
  pg_temp.affected($$update public.profile set suspended = false
    where id = '00000000-0000-4000-8000-000000000004'$$),
  0,
  'a user cannot unsuspend another user'
);
select is(
  pg_temp.sqlstate_of($$update public.profile set stripe_account_id = 'acct_attacker'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  '42501',
  'a user cannot set their own Stripe account id'
);
select is(
  pg_temp.sqlstate_of($$update public.profile set stripe_onboarding_complete = true
    where id = '00000000-0000-4000-8000-000000000005'$$),
  '42501',
  'a user cannot mark their own Stripe onboarding complete'
);
select is(
  pg_temp.affected($$update public.profile set display_name = 'Dana D.'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  1,
  'a user can update their own display name'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status)
    values ('10000000-0000-4000-8000-000000000001', 100, 'KES', 'confirmed')$$),
  '42501',
  'a signed-in donor cannot write donations directly'
);

-- Suspended organiser (Sam owns c6).

select pg_temp.become('00000000-0000-4000-8000-000000000004', 'authenticated');

select is(
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount, currency)
    values ('00000000-0000-4000-8000-000000000004', 'Sneaky campaign', 'sneaky-campaign', 'Other', 'GB', 100, 'GBP')$$),
  '42501',
  'suspended users cannot create campaigns'
);
select is(
  pg_temp.affected($$update public.campaign set title = 'Still editing'
    where id = '10000000-0000-4000-8000-000000000006'$$),
  0,
  'suspended users cannot edit their suspended campaign'
);
select is(
  pg_temp.sqlstate_of($$insert into public.campaign_update (campaign_id, author_id, body)
    values ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000004', 'Posting while suspended')$$),
  '42501',
  'suspended users cannot post campaign updates'
);

-- Admin.

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');

select is((select count(*)::int from public.campaign), 6, 'admin reads every campaign, including drafts and suspended');
select is((select count(*)::int from public.report), 2, 'admin reads every report');
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status)
    values ('10000000-0000-4000-8000-000000000001', 100, 'KES', 'confirmed')$$),
  '42501',
  'admin cannot write donations directly either'
);
select is(
  pg_temp.affected($$update public.report set status = 'actioned'
    where status = 'open'$$),
  1,
  'admin can change report status'
);
select is(
  pg_temp.sqlstate_of($$update public.report set reason = 'Rewritten by admin'$$),
  '42501',
  'admin cannot rewrite a report reason'
);
select is(
  pg_temp.affected($$update public.profile set role = 'admin'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  1,
  'admin can grant the admin role to another user'
);
select is(
  pg_temp.affected($$update public.profile set suspended = false
    where id = '00000000-0000-4000-8000-000000000004'$$),
  1,
  'admin can unsuspend a user'
);
select is(
  pg_temp.affected($$update public.campaign set status = 'suspended'
    where id = '10000000-0000-4000-8000-000000000004'$$),
  1,
  'admin can suspend a live campaign'
);

-- Server (service role): the only writer of donations and payout fields.

select pg_temp.become(null, 'service_role');

select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id, stripe_checkout_session_id, confirmed_at)
    values ('10000000-0000-4000-8000-000000000002', 1000, 'KES', 'confirmed', 'evt_test_new_0001', 'cs_test_new_0001', now())$$),
  null,
  'service role records a confirmed donation from a webhook'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id, stripe_checkout_session_id, confirmed_at)
    values ('10000000-0000-4000-8000-000000000002', 1000, 'KES', 'confirmed', 'evt_test_new_0001', 'cs_test_new_0002', now())$$),
  '23505',
  'a replayed Stripe event id is rejected by the unique constraint (idempotent webhooks)'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status)
    values ('10000000-0000-4000-8000-000000000002', 500, 'KES', 'confirmed')$$),
  '23514',
  'a confirmed donation without a Stripe event id is rejected'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id)
    values ('10000000-0000-4000-8000-000000000002', 9999, 'KES', 'pending', 'evt_test_pending_0001')$$),
  null,
  'service role records a pending donation'
);
select is(
  (select raised_amount from public.campaign_totals where campaign_id = '10000000-0000-4000-8000-000000000002'),
  1000::bigint,
  'pending donations do not count toward totals'
);
select is(
  pg_temp.affected($$update public.profile set stripe_onboarding_complete = true, stripe_account_id = 'acct_test_dana'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  1,
  'service role sets payout fields'
);

-- Unauthenticated clients never see another organiser's draft through totals either.

select pg_temp.become(null, 'anon');

select is(
  (select count(*)::int from public.campaign_totals where campaign_id = '10000000-0000-4000-8000-000000000003'),
  0,
  'anon sees no totals for draft campaigns'
);

select * from finish();

rollback;

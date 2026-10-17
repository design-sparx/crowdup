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

select plan(181);

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


select is((select count(*)::int from public.campaign), 7, 'seed creates seven campaigns');
select is((select count(*)::int from public.donation where status = 'confirmed'), 5,
  'seed creates five confirmed donations');
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

-- Organiser dashboard reads (ticket 12): confirmed donations only, anonymity respected.
select is(
  (select count(*)::int from public.public_donation where campaign_id = '10000000-0000-4000-8000-000000000001'),
  3,
  'organiser sees only the three confirmed donations on their campaign'
);
select is(
  (select count(*)::int from public.public_donation
    where campaign_id = '10000000-0000-4000-8000-000000000001' and anonymous and donor_name is null),
  1,
  'organiser sees the anonymous donation without a donor name'
);
select is(
  pg_temp.sqlstate_of($$select donor_email from public.public_donation$$),
  '42703',
  'organiser cannot read donor emails through the donation view'
);

select is((select count(*)::int from public.campaign), 5,
  'owner sees their own campaigns in every state plus other live campaigns');
select is(
  (select count(*)::int from public.campaign where owner_id = '00000000-0000-4000-8000-000000000002'),
  4,
  'owner sees all four of their campaigns, including the draft and the pending one'
);
select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000006'),
  0,
  'owner cannot read another organiser''s suspended campaign'
);
select is(
  pg_temp.affected($$update public.campaign set goal_amount = goal_amount
    where id = '10000000-0000-4000-8000-000000000001'$$),
  1,
  'owner can edit the goal of their own live campaign'
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
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount, currency)
    values ('00000000-0000-4000-8000-000000000002', 'Chosen currency', 'chosen-currency', 'Other', 'KE', 100, 'USD')$$),
  '42501',
  'owner cannot choose a currency when creating a campaign'
);
select is(
  pg_temp.affected($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount)
    values ('00000000-0000-4000-8000-000000000002', 'No currency yet', 'no-currency-yet', 'Other', 'KE', 100)$$),
  1,
  'owner can create a draft without a currency'
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
  pg_temp.sqlstate_of($$update public.profile set suspended = true
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
  pg_temp.sqlstate_of($$update public.profile set stripe_currency = 'USD'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  '42501',
  'a user cannot set their own Stripe currency'
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
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount)
    values ('00000000-0000-4000-8000-000000000004', 'Sneaky campaign', 'sneaky-campaign', 'Other', 'GB', 100)$$),
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

select is((select count(*)::int from public.campaign), 8, 'admin reads every campaign, including drafts and suspended (and the draft created by an owner earlier in this file)');
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
-- Restore Dana to a plain user so later tests that act as her really exercise a non-admin.
select is(
  pg_temp.affected($$update public.profile set role = 'user'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  1,
  'admin can revoke the admin role again'
);
select is(
  pg_temp.sqlstate_of($$update public.profile set suspended = false
    where id = '00000000-0000-4000-8000-000000000004'$$),
  '42501',
  'admin cannot change suspension directly, only through the audited function'
);
select is(
  pg_temp.sqlstate_of($$select public.admin_unsuspend_user('00000000-0000-4000-8000-000000000004')$$),
  null,
  'admin can unsuspend a user through the function'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'suspended'
    where id = '10000000-0000-4000-8000-000000000004'$$),
  '42501',
  'admin cannot suspend a campaign directly, only through the audited function'
);
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_campaign('10000000-0000-4000-8000-000000000004', 'Test suspension')$$),
  null,
  'admin can suspend a live campaign through the function'
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
reset role;
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
select is(
  pg_temp.affected($$update public.profile set stripe_currency = 'KES'
    where id = '00000000-0000-4000-8000-000000000005'$$),
  1,
  'service role sets the Stripe currency'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set currency = 'USD'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  '42501',
  'even the service role cannot change a campaign currency once set'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'live', published_at = now(), currency = 'KES'
    where id = (select id from public.campaign where slug = 'no-currency-yet')$$),
  null,
  'service role publishes a currency-less draft and sets its currency'
);

-- Unauthenticated clients never see another organiser's draft through totals either.

select pg_temp.become(null, 'anon');

select is(
  (select count(*)::int from public.campaign_totals where campaign_id = '10000000-0000-4000-8000-000000000003'),
  0,
  'anon sees no totals for draft campaigns'
);

-- Another organiser (Liam) cannot see or edit Amara's draft (c3).

select pg_temp.become('00000000-0000-4000-8000-000000000003', 'authenticated');

select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  0,
  'another organiser cannot read a draft'
);
select is(
  pg_temp.affected($$update public.campaign set title = 'Hijacked draft'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  0,
  'another organiser cannot edit a draft'
);
select is(
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount)
    values ('00000000-0000-4000-8000-000000000002', 'Forged owner', 'forged-owner', 'Other', 'KE', 100)$$),
  '42501',
  'a user cannot create a campaign owned by someone else'
);

-- Cover image storage (campaign-covers bucket, migration 20261016100300).

reset role;
select is(
  (select file_size_limit from storage.buckets where id = 'campaign-covers'),
  3145728::bigint,
  'the cover bucket enforces a 3 MB size limit'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'campaign-covers'),
  array['image/jpeg', 'image/png', 'image/webp'],
  'the cover bucket allows only jpeg, png and webp'
);
select pg_temp.become('00000000-0000-4000-8000-000000000003', 'authenticated');
select is(
  pg_temp.sqlstate_of($$insert into storage.objects (bucket_id, name, owner)
    values ('campaign-covers', '00000000-0000-4000-8000-000000000003/mine.png', '00000000-0000-4000-8000-000000000003')$$),
  null,
  'a user can upload a cover into their own folder'
);
select is(
  pg_temp.sqlstate_of($$insert into storage.objects (bucket_id, name, owner)
    values ('campaign-covers', '00000000-0000-4000-8000-000000000002/theirs.png', '00000000-0000-4000-8000-000000000003')$$),
  '42501',
  'a user cannot upload a cover into another user''s folder'
);

-- An admin test above unsuspended Sam; suspend him again so this really tests a suspended user.
reset role;
update public.profile set suspended = true where id = '00000000-0000-4000-8000-000000000004';
select pg_temp.become('00000000-0000-4000-8000-000000000004', 'authenticated');

select is(
  pg_temp.sqlstate_of($$insert into storage.objects (bucket_id, name, owner)
    values ('campaign-covers', '00000000-0000-4000-8000-000000000004/sam.png', '00000000-0000-4000-8000-000000000004')$$),
  '42501',
  'a suspended user cannot upload a cover'
);

select pg_temp.become(null, 'anon');

select is(
  pg_temp.sqlstate_of($$insert into storage.objects (bucket_id, name)
    values ('campaign-covers', 'anon.png')$$),
  '42501',
  'anon cannot upload a cover'
);

-- Reports: anyone can file one, one open report per signed-in reporter, admin-only triage.

select pg_temp.become(null, 'anon');

select is(
  pg_temp.sqlstate_of($$insert into public.report (campaign_id, reason)
    values ('10000000-0000-4000-8000-000000000001', 'Guest report on a live campaign')$$),
  null,
  'anon can report a live campaign'
);
select is(
  pg_temp.sqlstate_of($$insert into public.report (campaign_id, reason, status)
    values ('10000000-0000-4000-8000-000000000001', 'Guest picks the status', 'dismissed')$$),
  '42501',
  'anon cannot choose a report status'
);

select pg_temp.become('00000000-0000-4000-8000-000000000005', 'authenticated');

select is(
  pg_temp.sqlstate_of($$insert into public.report (campaign_id, reporter_id, reason)
    values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000005', 'Signed-in report')$$),
  null,
  'signed-in user can report a live campaign as themselves'
);
select is(
  pg_temp.sqlstate_of($$insert into public.report (campaign_id, reporter_id, reason)
    values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000005', 'Second open report')$$),
  '23505',
  'a second open report from the same user on the same campaign is rejected'
);
select is(
  pg_temp.sqlstate_of($$insert into public.report (campaign_id, reporter_id, reason)
    values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Impersonated reporter')$$),
  '42501',
  'a user cannot file a report as someone else'
);
select is(
  pg_temp.affected($$update public.report set status = 'dismissed'$$),
  0,
  'non-admin cannot change report status'
);
select is(
  (select count(*)::int from public.report),
  0,
  'a reporter cannot read reports, not even their own'
);

-- Lifecycle: automatic closing and the donation guard.

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');

select is(
  pg_temp.sqlstate_of($$select public.close_expired_campaigns()$$),
  '42501',
  'signed-in users cannot run the expiry job'
);

reset role;
update public.campaign set end_date = now() - interval '1 hour'
  where id = '10000000-0000-4000-8000-000000000002';

select pg_temp.become(null, 'service_role');
select public.close_expired_campaigns();

select is(
  (select status from public.campaign where id = '10000000-0000-4000-8000-000000000002'),
  'closed',
  'the expiry job closes a live campaign past its end date'
);
select is(
  (select status from public.campaign where id = '10000000-0000-4000-8000-000000000001'),
  'live',
  'the expiry job leaves campaigns with a future end date live'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id)
    values ('10000000-0000-4000-8000-000000000002', 100, 'KES', 'pending', 'evt_test_closed_0001')$$),
  '23514',
  'a new pending donation on a closed campaign is rejected'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id)
    values ('10000000-0000-4000-8000-000000000001', 100, 'KES', 'pending', 'evt_test_live_0001')$$),
  null,
  'a new pending donation on a live campaign is accepted'
);

-- Donation checkout (ticket 18): donor_user_id and flagged_reason.

select pg_temp.become(null, 'service_role');
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id, confirmed_at, donor_user_id, flagged_reason)
    values ('10000000-0000-4000-8000-000000000005', 700, 'KES', 'confirmed', 'evt_test_flag_0001', now(),
            '00000000-0000-4000-8000-000000000005', 'campaign not live at payment time')$$),
  null,
  'service role records a signed-in donor and a flag, even on a closed campaign (money already moved)'
);
select pg_temp.become(null, 'anon');
select is(
  pg_temp.sqlstate_of('select donor_user_id from public.public_donation'),
  '42703',
  'the public donor list does not expose the donor user id'
);
select pg_temp.become('00000000-0000-4000-8000-000000000005', 'authenticated');
select is(
  pg_temp.sqlstate_of('select donor_user_id, flagged_reason from public.donation'),
  '42501',
  'a signed-in donor cannot read the donation table, so donor ids and flags stay private'
);

-- Moderation (ticket 21). State at this point: Sam was unsuspended and c4 suspended by
-- the admin tests above (2 audit rows so far: user_unsuspended, campaign_suspended).
-- Amara (...0002) is an ordinary organiser, Liam (...0003) owns c4 and c5.

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');

select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_campaign('10000000-0000-4000-8000-000000000001', 'I want this gone')$$),
  '42501', 'non-admin cannot suspend a campaign');
select is(
  pg_temp.sqlstate_of($$select public.admin_restore_campaign('10000000-0000-4000-8000-000000000004')$$),
  '42501', 'non-admin cannot restore a campaign');
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_user('00000000-0000-4000-8000-000000000003', 'I dislike them')$$),
  '42501', 'non-admin cannot suspend a user');
select is(
  pg_temp.sqlstate_of($$select public.admin_unsuspend_user('00000000-0000-4000-8000-000000000004')$$),
  '42501', 'non-admin cannot unsuspend a user');
select is(
  pg_temp.sqlstate_of($$insert into public.moderation_action (admin_id, action, target_type, target_id, reason)
    values ('00000000-0000-4000-8000-000000000002', 'user_suspended', 'user', '00000000-0000-4000-8000-000000000003', 'forged')$$),
  '42501', 'non-admin cannot write the audit table');
select is(
  (select count(*)::int from public.moderation_action), 0,
  'non-admin cannot read the audit table');

select pg_temp.become(null, 'anon');
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_campaign('10000000-0000-4000-8000-000000000002', 'anonymous attempt')$$),
  '42501', 'anon cannot call the moderation functions');

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');

select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_campaign('10000000-0000-4000-8000-000000000002', 'ab')$$),
  '23514', 'a suspension requires a reason of at least 3 characters');
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_campaign('10000000-0000-4000-8000-000000000003', 'Draft suspension')$$),
  '23514', 'a draft campaign cannot be suspended');
select is(
  pg_temp.sqlstate_of($$select public.admin_restore_campaign('10000000-0000-4000-8000-000000000002')$$),
  '23514', 'a campaign that is not suspended cannot be restored');
-- The lifecycle block above closed campaign 2 with the expiry job; reopen it so this test
-- really suspends a live campaign.
reset role;
update public.campaign set status = 'live', end_date = null
  where id = '10000000-0000-4000-8000-000000000002';
select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_campaign('10000000-0000-4000-8000-000000000002', 'Misleading claims')$$),
  null, 'admin can suspend a live campaign with a reason');
select is(
  (select status || '/' || suspended_from_status || '/' || suspended_reason
     from public.campaign where id = '10000000-0000-4000-8000-000000000002'),
  'suspended/live/Misleading claims', 'suspension stores the prior status and the reason');
select is(
  (select count(*)::int from public.moderation_action
    where action = 'campaign_suspended' and target_type = 'campaign'
      and target_id = '10000000-0000-4000-8000-000000000002'
      and admin_id = '00000000-0000-4000-8000-000000000001' and reason = 'Misleading claims'),
  1, 'the suspension wrote an audit row in the same transaction');
select is(
  (select count(*)::int from public.moderation_action), 3,
  'admin can read the audit table');

select pg_temp.become(null, 'anon');
select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000002'), 0,
  'a suspended campaign is not publicly readable');

select pg_temp.become(null, 'service_role');
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status)
    values ('10000000-0000-4000-8000-000000000002', 500, 'KES', 'pending')$$),
  '23514', 'a suspended campaign refuses new pending donations');

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');
select is(
  (select suspended_reason from public.campaign where id = '10000000-0000-4000-8000-000000000002'),
  'Misleading claims', 'the owner can still read their suspended campaign and its reason');
select is(
  pg_temp.affected($$update public.campaign set title = 'Editing while suspended'
    where id = '10000000-0000-4000-8000-000000000002'$$),
  0, 'the owner cannot edit their suspended campaign');
select is(
  pg_temp.sqlstate_of($$update public.campaign set suspended_reason = null
    where id = '10000000-0000-4000-8000-000000000002'$$),
  '42501', 'the owner cannot clear a suspension reason themselves');

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.admin_restore_campaign('10000000-0000-4000-8000-000000000002')$$),
  null, 'admin can restore a campaign');
select is(
  (select status || '/' || coalesce(suspended_reason, 'none')
     from public.campaign where id = '10000000-0000-4000-8000-000000000002'),
  'live/none', 'restore returns the campaign to its prior status and clears the reason');
select is(
  (select count(*)::int from public.moderation_action
    where action = 'campaign_restored' and target_id = '10000000-0000-4000-8000-000000000002'),
  1, 'the restore wrote an audit row');
select is(
  pg_temp.sqlstate_of($$select public.admin_restore_campaign('10000000-0000-4000-8000-000000000006')$$),
  null, 'admin can restore a suspended campaign that has no stored prior status');
select is(
  (select status from public.campaign where id = '10000000-0000-4000-8000-000000000006'),
  'closed', 'a campaign with no stored prior status is restored to closed, not live');
select is(
  pg_temp.sqlstate_of($$insert into public.moderation_action (admin_id, action, target_type, target_id, reason)
    values ('00000000-0000-4000-8000-000000000001', 'user_suspended', 'user', '00000000-0000-4000-8000-000000000003', 'forged')$$),
  '42501', 'even an admin cannot write the audit table directly');
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_user('00000000-0000-4000-8000-000000000001', 'Suspending myself')$$),
  '23514', 'an admin cannot suspend themselves');
select is(
  pg_temp.sqlstate_of($$select public.admin_suspend_user('00000000-0000-4000-8000-000000000003', 'Policy violation')$$),
  null, 'admin can suspend a user');
select is(
  (select suspended::text || '/' || suspended_reason from public.profile where id = '00000000-0000-4000-8000-000000000003'),
  'true/Policy violation', 'user suspension stores the reason');

select pg_temp.become('00000000-0000-4000-8000-000000000003', 'authenticated');
select is(
  pg_temp.sqlstate_of($$insert into public.campaign (owner_id, title, slug, category, country, goal_amount)
    values ('00000000-0000-4000-8000-000000000003', 'Suspended organiser', 'suspended-organiser', 'Other', 'GB', 100)$$),
  '42501', 'a user suspended by an admin cannot create campaigns');
select is(
  pg_temp.affected($$update public.campaign set title = 'Still editing'
    where id = '10000000-0000-4000-8000-000000000005'$$),
  0, 'a user suspended by an admin cannot edit campaigns');

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.admin_unsuspend_user('00000000-0000-4000-8000-000000000003')$$),
  null, 'admin can unsuspend a user');
select is(
  pg_temp.sqlstate_of($$select public.admin_unsuspend_user('00000000-0000-4000-8000-000000000003')$$),
  'P0002', 'unsuspending a user who is not suspended is reported, not silently audited');
select is(
  (select count(*)::int from public.moderation_action where target_type = 'user'
     and target_id = '00000000-0000-4000-8000-000000000003'),
  2, 'both user actions are in the audit trail');

-- Admin approval mode (ticket 22): pending_approval, rejected, approve/reject functions.
-- Uses c3 (Amara's draft). Admin is ...0001, Amara ...0002, Liam ...0003.

select ok(
  not public.campaign_status_transition_allowed('owner', 'draft', 'live')
  and not public.campaign_status_transition_allowed('owner', 'draft', 'pending_approval')
  and public.campaign_status_transition_allowed('owner', 'rejected', 'draft')
  and public.campaign_status_transition_allowed('server', 'draft', 'pending_approval')
  and public.campaign_status_transition_allowed('server', 'live', 'pending_approval')
  and not public.campaign_status_transition_allowed('owner', 'live', 'pending_approval')
  and not public.campaign_status_transition_allowed('server', 'closed', 'pending_approval')
  and not public.campaign_status_transition_allowed('server', 'live', 'rejected'),
  'the transition table matches the documented rules'
);

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'pending_approval'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  '42501',
  'an owner cannot submit their own draft for approval (the server does)'
);

select pg_temp.become(null, 'service_role');
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'pending_approval'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  null,
  'the server moves a draft to pending_approval'
);
select is(
  pg_temp.sqlstate_of($$insert into public.donation (campaign_id, amount, currency, status, stripe_event_id)
    values ('10000000-0000-4000-8000-000000000003', 100, 'KES', 'pending', 'evt_test_pending_campaign')$$),
  '23514',
  'a pending_approval campaign does not accept donations'
);

select pg_temp.become(null, 'anon');
select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  0,
  'anon cannot see a pending_approval campaign'
);
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000003')$$),
  '42501',
  'anon cannot call approve_campaign'
);

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'live', published_at = now()
    where id = '10000000-0000-4000-8000-000000000007'$$),
  '42501',
  'an owner cannot self-approve (a pending campaign is locked for the owner)'
);
select is(
  pg_temp.affected($$update public.campaign set title = 'Edited while pending'
    where id = '10000000-0000-4000-8000-000000000007'$$),
  0,
  'an owner cannot edit a campaign while it is pending approval'
);
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000003')$$),
  '42501',
  'the owner cannot call approve_campaign'
);

select pg_temp.become('00000000-0000-4000-8000-000000000003', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000003')$$),
  '42501',
  'a non-admin organiser cannot approve'
);
select is(
  pg_temp.sqlstate_of($$select public.reject_campaign('10000000-0000-4000-8000-000000000003', 'Not good enough')$$),
  '42501',
  'a non-admin organiser cannot reject'
);

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.reject_campaign('10000000-0000-4000-8000-000000000003', '  ')$$),
  '23514',
  'an admin must give a rejection reason'
);
select is(
  pg_temp.sqlstate_of($$select public.reject_campaign('10000000-0000-4000-8000-000000000003', 'Needs a clearer description')$$),
  null,
  'an admin rejects a pending campaign with a reason'
);
select is(
  (select status || '/' || rejection_reason from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  'rejected/Needs a clearer description',
  'the campaign is rejected and stores the reason'
);
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000003')$$),
  'P0002',
  'a rejected campaign cannot be approved without being resubmitted'
);

select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');
select is(
  (select rejection_reason from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  'Needs a clearer description',
  'the owner can read the rejection reason'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set rejection_reason = null
    where id = '10000000-0000-4000-8000-000000000003'$$),
  '42501',
  'the owner cannot clear the rejection reason'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'live', published_at = now()
    where id = '10000000-0000-4000-8000-000000000003'$$),
  '42501',
  'the owner cannot publish a rejected campaign'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'pending_approval'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  '42501',
  'the owner cannot resubmit a rejected campaign directly; it must be reopened as a draft first'
);
select is(
  pg_temp.affected($$update public.campaign set status = 'draft'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  1,
  'the owner reopens a rejected campaign as a draft'
);

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000003')$$),
  'P0002',
  'a draft cannot be approved (it must be submitted first)'
);

select pg_temp.become(null, 'service_role');
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'pending_approval'
    where id = '10000000-0000-4000-8000-000000000003'$$),
  null,
  'the server resubmits the reopened draft'
);
select is(
  (select rejection_reason from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  null,
  'resubmission clears the old rejection reason'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'pending_approval'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  null,
  'the server can send a live campaign back to review (edited content)'
);
-- Put c1 back: later tests rely on it being live.
update public.campaign set status = 'live', published_at = coalesce(published_at, now())
  where id = '10000000-0000-4000-8000-000000000001';
select is(
  pg_temp.sqlstate_of($$update public.campaign set status = 'pending_approval'
    where id = (select id from public.campaign where status = 'closed' limit 1)$$),
  '42501',
  'even the server cannot move a closed campaign to pending_approval'
);

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000003')$$),
  null,
  'an admin approves a pending campaign'
);
select is(
  (select status from public.campaign where id = '10000000-0000-4000-8000-000000000003')
    || '/' || (select (published_at is not null)::text from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  'live/true',
  'approval makes the campaign live and sets published_at'
);
select is(
  pg_temp.sqlstate_of($$select public.reject_campaign('10000000-0000-4000-8000-000000000003', 'Too late to reject')$$),
  'P0002',
  'a live campaign cannot be rejected'
);

select pg_temp.become(null, 'anon');
select is(
  (select count(*)::int from public.campaign where id = '10000000-0000-4000-8000-000000000003'),
  1,
  'an approved campaign is publicly visible'
);

-- Donor donation history (ticket 19): my_donation shows a user only their own confirmed rows.

select pg_temp.become(null, 'service_role');
insert into public.donation (id, campaign_id, amount, currency, donor_name, donor_email, status, stripe_event_id, confirmed_at, donor_user_id)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 1100, 'KES', 'Dana Donor', 'dana@crowdup.example', 'confirmed', 'evt_test_hist_0001', now(), '00000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 1200, 'KES', 'Liam', 'liam@crowdup.example', 'confirmed', 'evt_test_hist_0002', now(), '00000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 1300, 'KES', 'Dana Guest', 'dana@crowdup.example', 'confirmed', 'evt_test_hist_0003', now(), null);
insert into public.donation (id, campaign_id, amount, currency, status, donor_user_id)
values ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 1400, 'KES', 'pending', '00000000-0000-4000-8000-000000000005');

select pg_temp.become('00000000-0000-4000-8000-000000000005', 'authenticated');
select is(
  (select count(*)::int from public.my_donation where id = '20000000-0000-4000-8000-000000000001'),
  1,
  'a donor sees their own confirmed donation in my_donation'
);
select is(
  (select count(*)::int from public.my_donation where id = '20000000-0000-4000-8000-000000000002'),
  0,
  'a donor does not see another user''s donation in my_donation'
);
select is(
  (select count(*)::int from public.my_donation where id = '20000000-0000-4000-8000-000000000003'),
  0,
  'a guest donation with the same email as the donor is not exposed in my_donation'
);
select is(
  (select count(*)::int from public.my_donation where id = '20000000-0000-4000-8000-000000000004'),
  0,
  'a donor''s own pending donation is not listed in my_donation'
);
select is(
  pg_temp.sqlstate_of('select donor_email from public.my_donation'),
  '42703',
  'my_donation exposes no donor email'
);
select pg_temp.become(null, 'anon');
select is(
  pg_temp.sqlstate_of('select * from public.my_donation'),
  '42501',
  'anonymous visitors cannot read my_donation'
);

-- Review follow-ups: live content edits, unmatched payments, approval eligibility.
-- c1 is Amara's live campaign.
select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');
select is(
  pg_temp.sqlstate_of($$update public.campaign set title = 'Swapped for a scam'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'an owner cannot change the title of a live campaign directly'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set description = 'x'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'an owner cannot change the summary of a live campaign directly'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set story = '{"type":"doc","content":[]}'::jsonb
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'an owner cannot change the story of a live campaign directly'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set cover_image_url = 'https://evil.example/x.png'
    where id = '10000000-0000-4000-8000-000000000001'$$),
  '42501',
  'an owner cannot change the cover of a live campaign directly'
);
select is(
  pg_temp.sqlstate_of($$update public.campaign set goal_amount = goal_amount + 100, end_date = null
    where id = '10000000-0000-4000-8000-000000000001'$$),
  null,
  'an owner can still change the goal and end date of a live campaign'
);

select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$update public.campaign set title = title
    where id = '10000000-0000-4000-8000-000000000001'$$),
  null,
  'an admin can still edit a live campaign'
);

select pg_temp.become(null, 'anon');
select is(
  pg_temp.sqlstate_of('select count(*) from public.unmatched_payment'),
  '42501',
  'anonymous visitors cannot read unmatched payments'
);
select pg_temp.become('00000000-0000-4000-8000-000000000002', 'authenticated');
select is(
  pg_temp.sqlstate_of('select count(*) from public.unmatched_payment'),
  '42501',
  'signed-in users cannot read unmatched payments'
);
select pg_temp.become(null, 'service_role');
select is(
  pg_temp.sqlstate_of($$insert into public.unmatched_payment
    (stripe_event_id, stripe_account_id, amount, currency, reason)
    values ('evt_unmatched_1', 'acct_x', 500, 'KES', 'unknown campaign')$$),
  null,
  'the server records an unmatched payment'
);
select is(
  pg_temp.sqlstate_of($$insert into public.unmatched_payment
    (stripe_event_id, stripe_account_id, amount, currency, reason)
    values ('evt_unmatched_1', 'acct_x', 500, 'KES', 'unknown campaign')$$),
  '23505',
  'a redelivered event is recorded once'
);

-- approve_campaign refuses an organiser who cannot take donations.
update public.campaign set status = 'pending_approval'
  where id = '10000000-0000-4000-8000-000000000001';
update public.profile set stripe_onboarding_complete = false where id = '00000000-0000-4000-8000-000000000002';
select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000001')$$),
  'P0001',
  'approval is refused while the organiser has not completed Stripe onboarding'
);
select pg_temp.become(null, 'service_role');
update public.profile set stripe_onboarding_complete = true, suspended = true
  where id = '00000000-0000-4000-8000-000000000002';
select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000001')$$),
  'P0001',
  'approval is refused while the organiser is suspended'
);
select pg_temp.become(null, 'service_role');
update public.profile set suspended = false where id = '00000000-0000-4000-8000-000000000002';
select pg_temp.become('00000000-0000-4000-8000-000000000001', 'authenticated');
select is(
  pg_temp.sqlstate_of($$select public.approve_campaign('10000000-0000-4000-8000-000000000001')$$),
  null,
  'approval succeeds once the organiser is active and onboarded'
);

select * from finish();

rollback;

-- Sample data for local development and the public demo. Runs after the migrations on
-- `supabase db reset`. Everything here is fake: emails use the reserved .example domain,
-- and Stripe identifiers use test-mode prefixes. Users are created in auth.users, and the
-- profile trigger creates their profile rows.

-- Fixed ids so the permission tests and manual testing can refer to the same people.
-- Users and roles:
--   ...0001 admin, ...0002 organiser (live campaigns), ...0003 organiser (closed and
--   suspended campaigns), ...0004 suspended organiser, ...0005 donor with an account.

insert into auth.users (
  id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@crowdup.example', '{"provider":"email","providers":["email"]}', '{"full_name":"Ada Admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'amara@crowdup.example', '{"provider":"email","providers":["email"]}', '{"full_name":"Amara Wanjiru"}', now(), now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'liam@crowdup.example', '{"provider":"email","providers":["email"]}', '{"full_name":"Liam Okafor"}', now(), now()),
  ('00000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sam@crowdup.example', '{"provider":"email","providers":["email"]}', '{"full_name":"Sam Spammer"}', now(), now()),
  ('00000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'dana@crowdup.example', '{"provider":"email","providers":["email"]}', '{"full_name":"Dana Donor"}', now(), now());

update public.profile set role = 'admin' where id = '00000000-0000-4000-8000-000000000001';

update public.profile
set stripe_account_id = 'acct_test_amara', stripe_onboarding_complete = true
where id = '00000000-0000-4000-8000-000000000002';

update public.profile
set stripe_account_id = 'acct_test_liam', stripe_onboarding_complete = true
where id = '00000000-0000-4000-8000-000000000003';

update public.profile set suspended = true where id = '00000000-0000-4000-8000-000000000004';

insert into public.campaign (
  id, owner_id, title, slug, category, country, cover_image_url, description,
  goal_amount, currency, end_date, story, status, published_at, created_at
) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
   'Clean water for Kibera schools', 'clean-water-kibera-schools', 'Community', 'KE',
   'https://images.example/kibera-water.jpg',
   'Installing filtered water points in six primary schools so children stop drinking from the river.',
   500000, 'KES', now() + interval '60 days',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Six schools, one tap each."}]}]}',
   'live', now() - interval '20 days', now() - interval '25 days'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002',
   'Solar lamps for Turkana homes', 'solar-lamps-turkana', 'Environment', 'KE',
   null, 'Solar lanterns for families without grid power.',
   200000, 'KES', null,
   '{"type":"doc","content":[]}',
   'live', now() - interval '5 days', now() - interval '6 days'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002',
   'Youth football kit fund', 'youth-football-kit', 'Sports', 'KE',
   null, 'Kits for a community team. Not yet published.',
   80000, 'KES', null,
   '{"type":"doc","content":[]}',
   'draft', null, now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003',
   'Community kitchen in Ealing', 'community-kitchen-ealing', 'Food', 'GB',
   null, 'Hot meals every Friday for people who are struggling this winter.',
   150000, 'GBP', now() + interval '30 days',
   '{"type":"doc","content":[]}',
   'live', now() - interval '40 days', now() - interval '45 days'),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000003',
   'Rebuild the harbour library', 'rebuild-harbour-library', 'Education', 'GB',
   null, 'Funding closed after the roof repairs were finished.',
   900000, 'GBP', null,
   '{"type":"doc","content":[]}',
   'closed', now() - interval '120 days', now() - interval '130 days'),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000004',
   'Quick cash for a great cause', 'quick-cash-great-cause', 'Other', 'GB',
   null, 'Suspended after reports. Kept to exercise moderation.',
   1000000, 'GBP', null,
   '{"type":"doc","content":[]}',
   'suspended', now() - interval '3 days', now() - interval '4 days'),
  ('10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000002',
   'Books for the harbour library', 'books-harbour-library', 'Education', 'GB',
   null, 'Awaiting admin approval. Kept to exercise the approval queue.',
   250000, 'GBP', null,
   '{"type":"doc","content":[]}',
   'pending_approval', null, now() - interval '1 day');

insert into public.campaign_update (campaign_id, author_id, body, created_at) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
   'The first two schools now have working taps.', now() - interval '6 days'),
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002',
   'Thank you to everyone who gave this week.', now() - interval '1 day'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003',
   'We served 120 meals last Friday.', now() - interval '3 days');

-- Donations are written with the service role in production, from verified Stripe webhook
-- events. Seed rows follow the same rules: confirmed rows have a Stripe event id, and
-- pending and failed rows never count toward totals.
insert into public.donation (
  campaign_id, amount, fee_amount, currency, donor_name, donor_email, anonymous, message,
  stripe_checkout_session_id, stripe_payment_intent_id, stripe_event_id,
  status, created_at, confirmed_at
) values
  ('10000000-0000-4000-8000-000000000001', 5000, 0, 'KES', 'Dana Donor', 'dana@crowdup.example', false,
   'Keep going!', 'cs_test_0001', 'pi_test_0001', 'evt_test_0001',
   'confirmed', now() - interval '10 days', now() - interval '10 days'),
  ('10000000-0000-4000-8000-000000000001', 25000, 0, 'KES', null, null, true,
   null, 'cs_test_0002', 'pi_test_0002', 'evt_test_0002',
   'confirmed', now() - interval '8 days', now() - interval '8 days'),
  ('10000000-0000-4000-8000-000000000001', 10000, 0, 'KES', 'Kofi Mensah', 'kofi@crowdup.example', false,
   'For the children.', 'cs_test_0003', 'pi_test_0003', 'evt_test_0003',
   'confirmed', now() - interval '2 days', now() - interval '2 days'),
  ('10000000-0000-4000-8000-000000000001', 7500, 0, 'KES', 'Pending Payer', 'pending@crowdup.example', false,
   null, 'cs_test_0004', 'pi_test_0004', null,
   'pending', now() - interval '1 day', null),
  ('10000000-0000-4000-8000-000000000001', 3000, 0, 'KES', 'Failed Card', 'failed@crowdup.example', false,
   null, 'cs_test_0005', 'pi_test_0005', 'evt_test_0005',
   'failed', now() - interval '1 day', null),
  ('10000000-0000-4000-8000-000000000004', 4000, 0, 'GBP', 'Dana Donor', 'dana@crowdup.example', false,
   'Happy to help.', 'cs_test_0006', 'pi_test_0006', 'evt_test_0006',
   'confirmed', now() - interval '4 days', now() - interval '4 days'),
  ('10000000-0000-4000-8000-000000000004', 1500, 0, 'GBP', null, null, true,
   null, 'cs_test_0007', 'pi_test_0007', 'evt_test_0007',
   'confirmed', now() - interval '1 day', now() - interval '1 day');

insert into public.report (campaign_id, reporter_id, reason, status) values
  ('10000000-0000-4000-8000-000000000004', null,
   'The organiser asked for payments outside the platform.', 'open'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005',
   'The photos look reused from another campaign.', 'dismissed');

-- DEMO ONLY. Run after seed.sql by scripts/demo-reset.mjs. Never part of `supabase db reset`
-- (config.toml only lists seed.sql), so self-hosters never get these accounts.
--
-- Gives the seeded people a PUBLIC, documented password so visitors can log in without
-- signing up. Do not run this against a real instance. See docs/demo.md.
--   admin@crowdup.example   (admin)
--   amara@crowdup.example   (organiser)
--   dana@crowdup.example    (donor)
-- Password for all of them: demo-password-123

create extension if not exists pgcrypto with schema extensions;

update auth.users
set encrypted_password = extensions.crypt('demo-password-123', extensions.gen_salt('bf')),
    email_confirmed_at = now(),
    confirmation_token = '', recovery_token = '', email_change = '',
    email_change_token_new = '', email_change_token_current = '', reauthentication_token = '',
    phone_change = '', phone_change_token = ''
where email in ('admin@crowdup.example', 'amara@crowdup.example', 'dana@crowdup.example');

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       now(), now(), now()
from auth.users u
where u.email in ('admin@crowdup.example', 'amara@crowdup.example', 'dana@crowdup.example')
on conflict do nothing;

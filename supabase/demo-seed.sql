-- DEMO ONLY. Run after seed.sql by scripts/demo-reset.mjs. Never part of `supabase db reset`
-- (config.toml only lists seed.sql), so self-hosters never get these accounts.
--
-- Gives three of the seeded people a PUBLIC, documented password so visitors can log in
-- without signing up. Identities come from seed.sql, which demo-reset runs first.
-- Do not run this against a real instance. See docs/demo.md.
--   admin@crowdup.example   (admin)
--   amara@crowdup.example   (organiser)
--   dana@crowdup.example    (donor)
-- Password for all of them: demo-password-123

update auth.users
set encrypted_password = extensions.crypt('demo-password-123', extensions.gen_salt('bf')),
    email_confirmed_at = now(),
    confirmation_token = '', recovery_token = '', email_change = '',
    email_change_token_new = '', email_change_token_current = '', reauthentication_token = '',
    phone_change = '', phone_change_token = ''
where email in ('admin@crowdup.example', 'amara@crowdup.example', 'dana@crowdup.example');

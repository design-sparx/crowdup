-- Donor donation history (ticket 19): a donor reads only their own confirmed donations.
--
-- The donation table stays closed to clients (no grants, no policies). This view is owned
-- by postgres, so it bypasses donation RLS and filters explicitly: donor_user_id must equal
-- the caller's auth.uid(). Matching is by user id only, never by donor_email, so guest
-- donations made with the same email are not exposed. It exposes no donor email, donor
-- name, message, Stripe ids, fee or flag. Anon gets no privilege on the view.
create view public.my_donation
  with (security_barrier = true)
as
  select
    d.id,
    d.amount,
    d.currency,
    d.created_at,
    d.status,
    c.title as campaign_title,
    c.slug as campaign_slug
  from public.donation d
  join public.campaign c on c.id = d.campaign_id
  where d.donor_user_id = auth.uid()
    and d.status = 'confirmed';

revoke all on public.my_donation from anon, authenticated;
grant select on public.my_donation to authenticated;

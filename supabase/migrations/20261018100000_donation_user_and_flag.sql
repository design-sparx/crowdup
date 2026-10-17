-- Donation checkout (ticket 18): who donated, and payments that need a human look.
--
-- donor_user_id records the signed-in user at checkout time (null for guests). It is not
-- exposed by public_donation or any client grant: clients have no privileges on the table.
-- on delete set null keeps the donation (a financial record) when a profile is deleted.
--
-- flagged_reason is set by the webhook when money moved but something was off, for example
-- the campaign was no longer live when the payment completed. The donation is still
-- recorded (the organiser received the money); the flag lets an admin review it.

alter table public.donation
  add column donor_user_id uuid references public.profile (id) on delete set null,
  add column flagged_reason text check (char_length(flagged_reason) <= 200);

create index donation_donor_user_id_idx on public.donation (donor_user_id) where donor_user_id is not null;

-- Approving a campaign must not make it live when it cannot take money.
--
-- Donation checkout refuses campaigns whose owner is suspended or has not finished Stripe
-- onboarding. If the owner lost either state while the campaign waited for review, approval
-- used to publish a live campaign that rejected every donation. approve_campaign now checks
-- the owner first and leaves the campaign pending, with a reason the admin sees.
--   P0001 owner is suspended; P0001 owner has not completed Stripe onboarding.

create or replace function public.approve_campaign(p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_suspended boolean;
  v_onboarded boolean;
begin
  if not public.is_admin() then
    raise exception 'only administrators can approve campaigns' using errcode = '42501';
  end if;

  select p.suspended, p.stripe_onboarding_complete
    into v_suspended, v_onboarded
    from public.campaign c
    join public.profile p on p.id = c.owner_id
   where c.id = p_campaign_id and c.status = 'pending_approval';
  if not found then
    raise exception 'campaign is not pending approval' using errcode = 'P0002';
  end if;
  if v_suspended then
    raise exception 'the organiser is suspended, so this campaign cannot be approved' using errcode = 'P0001';
  end if;
  if not v_onboarded then
    raise exception 'the organiser has not completed Stripe onboarding, so this campaign cannot take donations' using errcode = 'P0001';
  end if;

  update public.campaign
     set status = 'live', published_at = now(), rejection_reason = null
   where id = p_campaign_id and status = 'pending_approval';
  if not found then
    raise exception 'campaign is not pending approval' using errcode = 'P0002';
  end if;
end;
$$;

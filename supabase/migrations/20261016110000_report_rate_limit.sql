-- Report abuse limit, database side: a signed-in user can have only one open report per
-- campaign. Guests (reporter_id null) are not covered by this index; they are limited per
-- IP in the app's action (src/lib/reports). Dismissing a report frees the slot.
create unique index report_one_open_per_reporter_idx
  on public.report (campaign_id, reporter_id)
  where status = 'open' and reporter_id is not null;

# Publishing modes and campaign approval

`PUBLISHING_MODE` (server env, default `auto`) is a per-deploy setting.

- `auto`: once the organiser's Stripe onboarding is complete, a draft goes live.
- `approval`: the draft moves to `pending_approval` instead and appears in the admin queue at `/admin/approvals` (count badge in the admin header). An admin approves it (`live`, `published_at` set) or rejects it with a required reason (`rejected`).
- Anything else is an error (a typo must not silently publish everything).

## Status transitions

Defined once in SQL (`campaign_status_transition_allowed`, enforced by the `guard_campaign_write` trigger) and mirrored in `src/lib/campaigns/transitions.ts`. Keep them in sync.

| From | To | Who |
| --- | --- | --- |
| draft | live | server (auto mode, Stripe ready) |
| draft | pending_approval | server (approval mode, Stripe ready) |
| pending_approval | live | admin, via `approve_campaign()` |
| pending_approval | rejected | admin, via `reject_campaign()` (reason 3-1000 chars) |
| rejected | draft | owner, automatically when they save an edit |
| live | closed | owner, server (expiry) |
| any | suspended | admin |

Resubmission: a rejected campaign shows the reason on the dashboard and edit page. Saving an edit reopens it as a draft; the organiser then presses Submit for approval (or the onboarding sync does it), which clears the old reason. Owners cannot edit while a campaign is `pending_approval`, so what is approved is what goes live. Only `live` accepts donations.

## Where the rules are enforced

The database does not know the mode. In both modes it guarantees that:

- a client (owner) cannot reach `live` or `pending_approval` and cannot write `rejection_reason`;
- `approve_campaign` / `reject_campaign` are `SECURITY DEFINER` with a pinned `search_path`, check `is_admin()` themselves and only act on `pending_approval`;
- `pending_approval` is only entered from `draft` and `rejected` only from `pending_approval`, for every role.

Known limit: the service role (server code) can still take a draft straight to `live` in approval mode if app code is wrong. Making the database mode-aware would need a settings table or GUC kept in sync with the env var; not done, to keep one source of truth. The admin loader and action also re-check admin status, and decisions use the admin's own session, never the service role.

Not verified by execution: the migration, pgTAP tests and the Playwright spec have never been run against a database.

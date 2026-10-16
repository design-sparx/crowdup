# Moderation

- /admin/campaigns and /admin/users: suspend (reason required, 3 to 1000 characters) and restore campaigns, suspend and unsuspend users. Loaders and actions re-check `is_admin()`; non-admins get 404.
- Each action is a SECURITY DEFINER SQL function (`admin_suspend_campaign`, `admin_restore_campaign`, `admin_suspend_user`, `admin_unsuspend_user`, `search_path` pinned to empty). It checks `is_admin()`, changes state and inserts a `moderation_action` row in one transaction. Triggers reject direct client writes to suspension fields (admins included), so the functions are the only client path.
- `moderation_action` is readable by admins only; no client can write it.
- Restore rule: suspending stores the prior status (`live` or `closed`) in `campaign.suspended_from_status`; restore returns to it. A missing prior status restores to `closed` (never accidentally live). A live campaign whose end date passed meanwhile shows as ended. Drafts cannot be suspended.
- Suspended campaigns are not publicly readable (404) and refuse new donations (`canAcceptDonations`, checkout, DB trigger). The owner still sees the reason on the dashboard and edit page. Suspended users see why they cannot create or edit.
- Not verified against a real database: run `pnpm test:db` and `pnpm test:e2e` with local Supabase.

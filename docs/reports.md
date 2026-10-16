# Reports and the admin queue

- Anyone, guests included, can report a live campaign (POST intent=report to the campaign route action). Reporters cannot read reports.
- Rate limit, two layers: (1) DB unique partial index, one open report per signed-in user per campaign (migration 20261016110000); (2) app: 5 reports/hour per user or per first X-Forwarded-For address for guests (src/lib/reports/rateLimit.ts). The app limiter is in memory: per server instance, resets on restart, so on serverless treat it as a speed bump. X-Forwarded-For is trustworthy only behind a proxy that sets it (Netlify does).
- /admin and /admin/reports return 404 unless public.is_admin() is true. Every admin loader and action re-checks it, and RLS limits report reads and status updates to admins.
- Not verified against a real database: run pnpm test:db and pnpm test:e2e with local Supabase.

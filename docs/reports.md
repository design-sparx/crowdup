# Reports and the admin queue

- Anyone, guests included, can report a live campaign (POST intent=report to the campaign route action). Reporters cannot read reports.
- Rate limit, two layers: (1) DB unique partial index, one open report per signed-in user per campaign (migration 20261016110000); (2) app: 5 reports/hour per user or per client IP for guests, read only from the header named in `CLIENT_IP_HEADER` (Netlify's header by default; no trusted header means one shared guest bucket) (src/lib/reports/rateLimit.ts). The app limiter is in memory: per server instance, resets on restart, so on serverless treat it as a speed bump. `X-Forwarded-For` is never used because a client can set it. The limit is spent only after the campaign is found, so mistyped slugs cost nothing.
- /admin and /admin/reports return 404 unless public.is_admin() is true. Every admin loader and action re-checks it, and RLS limits report reads and status updates to admins.
- Not verified against a real database: run pnpm test:db and pnpm test:e2e with local Supabase.

# Domain docs

## Layout (single-context)

- `CONTEXT.md` at the repo root — the single source of truth for project context
- `docs/adr/` — architecture decision records, one file per decision

## Consumer rules

Read `CONTEXT.md` first for the overall picture; consult `docs/adr/` for the decisions behind the current design. Treat both as read-only unless a decision has changed. No per-context split: this repo has no monorepo signals (`pnpm-workspace.yaml`, `packages/`), so single-context applies.

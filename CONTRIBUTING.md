# Contributing to CrowdUp

Thanks for your interest in CrowdUp. This guide covers setting up the project, the checks a change must pass, and how to open a pull request.

## Setup

You need Node.js (current LTS) and pnpm 9. Enable pnpm with Corepack:

```sh
corepack enable
git clone https://github.com/design-sparx/crowdup.git
cd crowdup
pnpm install
```

Use `pnpm` for everything. The lockfile is `pnpm-lock.yaml`; please do not commit `package-lock.json` or `yarn.lock`.

## Development

```sh
pnpm dev       # Vite dev server at http://localhost:5173
pnpm build     # tsc type-check, then production build
pnpm lint      # ESLint, zero warnings allowed
pnpm preview   # serve the production build
pnpm test      # run the unit tests (vitest)
pnpm test:db   # pgTAP database tests (needs Docker and the Supabase CLI)
```

Before opening a pull request, run `pnpm lint`, `pnpm build` and `pnpm test` and make sure all three pass.

### Browser tests

End-to-end tests live in `e2e/` and use [Playwright](https://playwright.dev). They run against the production build, so build first:

```sh
pnpm exec playwright install chromium   # once
supabase start && supabase db reset     # local Supabase with seed data (needs Docker)
pnpm build
pnpm test:e2e
```

Playwright starts the built app itself (`react-router-serve`, port 4173) and reuses a running server outside CI. To use a Chromium you already have, set `PLAYWRIGHT_CHROMIUM_PATH` to its executable. CI runs the same steps in the `End-to-end` workflow. Vitest ignores `e2e/`.

For a map of the codebase (routing, barrels, where shared UI lives), read [AGENTS.md](AGENTS.md).

Looking for somewhere to start? See the proposed [good first issues](docs/good-first-issues.md). Applying the `good first issue` label to the matching GitHub issues is a manual maintainer step.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Keep the change focused. One concern per pull request.
3. Follow the existing conventions: export new files from the relevant `index.ts` barrel, and name pages with a `Page` suffix.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (see below).

## Commit messages

Release versions and the changelog are generated from commit messages by [release-please](https://github.com/googleapis/release-please). Every commit that lands on `main` (usually via squash-merged pull request titles) should follow this format:

```text
<type>(optional scope): <short summary>

[optional body]

[optional footer(s)]
```

Allowed types:

| Type       | Use for                                   | Changelog section  |
| ---------- | ----------------------------------------- | ------------------ |
| `feat`     | a new user-facing feature                 | Features           |
| `fix`      | a bug fix                                 | Bug Fixes          |
| `perf`     | a performance improvement                 | Performance        |
| `docs`     | documentation only                        | Documentation      |
| `refactor` | a code change that neither fixes nor adds | hidden             |
| `test`     | adding or fixing tests                    | hidden             |
| `build`    | build system or dependency changes        | hidden             |
| `ci`       | CI configuration                          | hidden             |
| `chore`    | maintenance that does not fit above       | hidden             |
| `style`    | formatting only, no logic change          | hidden             |
| `revert`   | reverting an earlier commit               | Reverts            |

Examples:

```text
feat: add campaign filter
fix(donations): correct donation total
docs: explain release process in CONTRIBUTING
```

Mark breaking changes with a `!` after the type or a `BREAKING CHANGE:` footer:

```text
feat(api)!: rename campaign goal field

BREAKING CHANGE: `goal` is now `targetAmount` in campaign JSON.
```

While the project is on `0.x`, release-please uses these rules:

- a breaking change bumps the minor version (`0.1.0` -> `0.2.0`);
- a `feat` also bumps the minor version (`0.1.0` -> `0.2.0`);
- a `fix` or `perf` bumps the patch version (`0.1.0` -> `0.1.1`);
- other types do not trigger a release on their own.

The first major release (`1.0.0`) is a deliberate decision, so a breaking change on `0.x` does not move to `1.0.0` automatically.

On every push to `main`, release-please keeps one open "release pull request" that collects the unreleased changes and updates the changelog. Merging that pull request tags the release and creates the GitHub Release.

## Opening a pull request

- Describe what changed and why.
- Link the related issue, if there is one.
- For UI changes, include before and after screenshots.
- Confirm `pnpm build` and `pnpm lint` pass.

## Reporting bugs and ideas

Open a GitHub issue for bugs and feature requests. For security vulnerabilities, do not open a public issue; follow [SECURITY.md](SECURITY.md).

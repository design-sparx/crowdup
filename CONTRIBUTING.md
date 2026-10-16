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
```

There is no test runner yet. Before opening a pull request, run `pnpm build` and `pnpm lint` and make sure both pass.

For a map of the codebase (routing, barrels, where shared UI lives), read [AGENTS.md](AGENTS.md).

## Making a change

1. Fork the repository and create a branch from `main`.
2. Keep the change focused. One concern per pull request.
3. Follow the existing conventions: export new files from the relevant `index.ts` barrel, and name pages with a `Page` suffix.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, for example `feat: add campaign filter` or `fix: correct donation total`.

## Opening a pull request

- Describe what changed and why.
- Link the related issue, if there is one.
- For UI changes, include before and after screenshots.
- Confirm `pnpm build` and `pnpm lint` pass.

## Reporting bugs and ideas

Open a GitHub issue for bugs and feature requests. For security vulnerabilities, do not open a public issue; follow [SECURITY.md](SECURITY.md).

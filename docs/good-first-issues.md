# Good first issue candidates

Proposed starter tasks, each derived from a real gap in the code or docs. They are **proposals only**: no GitHub issues or labels have been created. Creating the issues and applying the `good first issue` label is a manual maintainer step. Every task should keep `pnpm lint`, `pnpm build` and `pnpm test` green and follow [CONTRIBUTING.md](../CONTRIBUTING.md).

| # | Title | Why it is small | Files to touch |
| --- | --- | --- | --- |
| 1 | Wire the search drawer to `/campaigns` | The campaigns page already reads `q`, `category` and `country` from the URL; the drawer is a stub with unconnected inputs. Make it a GET form (or navigate) to `/campaigns?q=...`. | `src/components/SearchDrawer.tsx`, `src/lib/campaigns/params.ts` (reference) |
| 2 | Remove or finish the unused `ContactCard` and `CheckoutPaymentModal` components | Neither is imported anywhere except the barrel; `ContactCard` only prints its form values and the modal shows fake payment buttons. Delete them, or note in the issue what they should become. | `src/components/ContactCard.tsx`, `src/components/CheckoutPaymentModal.tsx`, `src/components/index.ts` |
| 3 | Remove the unused `UserButton`/`User.json` mock user | `UserButton` is unreferenced and reads `src/data/User.json`; `UserCard` is real and takes props. Drop the mock data. | `src/components/UserButton.tsx`, `src/data/User.json`, `src/components/index.ts` |
| 4 | Replace placeholder home-page testimonials and footer links with an operator-editable config | Testimonials are fictional static JSON. Move them behind a clearly named config (like `src/data/legal.ts`) and document it in `docs/operators-legal.md`, or make the section optional. | `src/sections/Home/Testimonials.tsx`, `src/data/Testimonials.json`, `src/data/Footer.json` |
| 5 | Add screenshots and a demo GIF to the README | README has a marked placeholder. Needs a running local instance (see Quick start) and images under `docs/images/`. | `README.md`, `docs/images/` |
| 6 | Add unit tests for `clientKey` header edge cases | `clientKey` is tested for the main paths; add cases for empty and whitespace-padded values of the trusted header. Pure function, no database. | `src/lib/reports/reports.ts`, `src/lib/reports/reports.test.ts` |
| 7 | Add GitHub issue and pull request templates | `.github/` has workflows only. Add bug, feature and PR templates that match CONTRIBUTING (screenshots for UI changes, conventional commit titles). | `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md` |
| 8 | Add a Stripe Connect country-availability section to `docs/stripe.md` | The README warns Connect is not available everywhere. Link Stripe's supported-country pages and state the constraint plainly. Docs only. | `docs/stripe.md` |

Maintainers: when you create these as issues, link back to this file, add the `good first issue` label by hand, and delete rows as they are taken.

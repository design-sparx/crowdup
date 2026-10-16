![image](https://github.com/design-sparx/crowdup/assets/26582923/001cd476-c753-4087-96a6-ee8c99fc3612)

# CrowdUp: crowdfunding website

[![CI](https://github.com/design-sparx/crowdup/actions/workflows/ci.yml/badge.svg)](https://github.com/design-sparx/crowdup/actions/workflows/ci.yml)

[Online Demo](https://crowd-up.netlify.app/ "Online Demo")

TODO(ticket 24): replace with the live demo URL once deployed (see docs/demo.md).

### About

CrowdUp is a crowdfunding platform that helps you get funding for your personal projects, charities, and NGOs. Start a fundraiser and receive donations from individuals who care about your cause.

#### Available pages

1. Home
2. How it works
3. Campaigns
4. Campaign details
5. Create campaign
6. Dashboard

### Tech stack

- [Mantine 9](https://mantine.dev/getting-started/) (UI components, `@mantine/carousel`, `@mantine/dates`, `@mantine/dropzone`, `@mantine/form`, `@mantine/notifications`, `@mantine/tiptap`)
- [React 19](https://react.dev/)
- [react-router-dom 7](https://reactrouter.com/)
- [Tiptap](https://tiptap.dev/) rich text editor
- [ApexCharts](https://apexcharts.com/) via `react-apexcharts`
- [Tabler icons](https://tabler.io/icons)

**Dev dependencies:** TypeScript 6, Vite 8, ESLint 10.

### Getting started

**Software**

- Node.js (current LTS)
- pnpm 9 (install with `corepack enable`)
- Git

**Install and run**

```sh
git clone https://github.com/design-sparx/crowdup.git
cd crowdup
pnpm install
pnpm dev
```

The app runs at http://localhost:5173.

**Other scripts**

- `pnpm build` type-checks with `tsc` and builds with `vite build`
- `pnpm lint` runs ESLint with zero warnings allowed
- `pnpm preview` serves the production build

### Stripe

Organisers get paid through Stripe Connect. See [docs/stripe.md](docs/stripe.md) for setup and test mode.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and how to open a pull request. Report security issues privately as described in [SECURITY.md](SECURITY.md).

### Versions

v1.0: default project implementation

### Authors

1. Kelvin Kiptum Kiprop - https://github.com/kelvink96

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

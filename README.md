<p align="center">
  <a href="https://www.medusajs.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
      <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" height="58">
    </picture>
  </a>
</p>
<h1 align="center">Production-ready Medusa DTC Starter</h1>

<p align="center">
  by Gorgo
</p>

<h4 align="center">
  <a href="https://docs.gorgojs.com/tools/medusa-dtc-starter">Documentation</a> |
  <a href="https://dtc-starter-demo.gorgojs.com">Live demo</a> |
  <a href="https://gorgojs.com">Website</a>
</h4>

<p align="center">
  A production-ready <a href="https://medusajs.com/">Medusa</a> starter for direct-to-consumer commerce: a Medusa backend and a Next.js storefront with a conversion-focused checkout, 36 storefront languages, 241 countries, transactional emails, SEO with an <code>llms.txt</code> endpoint, and integrations you configure straight from the Medusa Admin.
</p>

<p align="center">
  <a href="https://t.me/medusajs_chat">
    <img src="https://img.shields.io/badge/Telegram-Medusa.js_Dev_Community_Chat-0088cc?logo=telegram&style=social" alt="Medusa.js Dev Community Chat on Telegram" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
  <img src="https://img.shields.io/badge/Medusa-2.19-7c3aed" alt="Medusa 2.19" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Node-%3E%3D20.19-339933?logo=nodedotjs&logoColor=white" alt="Node >= 20.19" />
  <img src="https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm&logoColor=white" alt="pnpm 10" />
</p>

<p align="center">
  <a href="https://static.gorgojs.com/videos/medusa-dtc-starter/medusa-dtc-starter-en.mp4">
    <img src="https://static.gorgojs.com/videos/medusa-dtc-starter/medusa-dtc-starter-en-preview-1787323985.webp" alt="Watch the Medusa DTC Starter demo video" width="100%" style="border-radius: 8px; max-width: 720px;">
  </a>
</p>

## Features

Everything the official [Medusa DTC Starter](https://github.com/medusajs/dtc-starter) ships, plus:

- **Conversion-focused checkout** – contacts, address, shipping, and payment each open as a sheet over one screen instead of a multi-page flow, with cart totals and promotion codes alongside. Every field can be removed or added.
- **Address autocomplete** – the address field suggests options as you type and fills in postal code, city, and region from the picked suggestion. [DaData](https://dadata.ru/?ref=276331) ships built in, any other provider plugs into the same interface, and the buyer can always switch to manual entry. See [Set Up Address Autocomplete](https://docs.gorgojs.com/tools/medusa-dtc-starter/setup-address-autocomplete).
- **Full localization** – [36 storefront languages](apps/storefront/src/i18n/config.ts) with RTL support, [241 seeded countries](apps/backend/src/migration-scripts/data/regions/json) for sales regions, each with its own currency and shipping options, and [emails in all 36 languages](apps/backend/src/emails/i18n/messages).
- **Automatic country detection** – a first-time visitor lands in the region their country belongs to, resolved from the hosting platform's geo headers or from their IP, instead of the first region the backend returns. Detection is a pluggable provider under [`lib/geolocation`](apps/storefront/src/lib/geolocation), and the region switcher still wins over it. See [Set Up Country Detection](https://docs.gorgojs.com/tools/medusa-dtc-starter/setup-country-detection).
- **Catalog search** – instant product search with highlighted matches, backed by the Store API and ready to swap for a dedicated engine such as [Meilisearch](https://www.meilisearch.com/).
- **Filterable catalog** – filters by product option, sorting by price and newest, a category and subcategory sidebar, and a bottom sheet on mobile. Selected filters live in the URL, so a curated selection can be shared as a link.
- **Transactional emails** – an SMTP notification provider sends [React Email](https://react.email/) templates through `nodemailer`, driven by subscribers for `customer.created`, `auth.password_reset`, `order.placed`, `order.completed`, `order.fulfillment_created`, `shipment.created`, `delivery.created`, `order.canceled`, `order.transfer_requested`, and `payment.captured`. The order follows the buyer through packing, shipping with its tracking number, delivery, and cancellation. Every email reaches the buyer in the language they shopped in, and the Admin's "do not notify" checkbox is respected.
- **On-demand cache revalidation** – a backend subscriber posts a webhook to the storefront on every catalog and translation event, and the storefront revalidates exactly the affected pages, the sitemap, and `llms.txt`.
- **[Integration Module](https://docs.gorgojs.com/medusa-modules/integration)** – payment, fulfillment, and ERP providers are configured under **Settings → Integrations** in the Admin, with no `medusa-config` edits and no redeploys. Secrets are encrypted at rest and validated before they take effect.
- **SEO and AI optimization** – the sitemap lists every catalog URL in all 36 locales, and `robots.txt` keeps crawlers out of the cart, checkout, and account. The home, store, product, category, and collection pages carry a canonical URL and hreflang alternates for every locale, Open Graph and Twitter images are set, and an [`llms.txt`](https://dtc-starter-demo.gorgojs.com/llms.txt) endpoint exposes the catalog to AI crawlers.

## Repository Structure

```
medusa-dtc-starter/
├── apps/
│   ├── backend/                     # Medusa application, Admin, and emails
│   │   ├── medusa-config.ts         # modules, plugins, feature flags
│   │   ├── scripts/                 # copies migration JSON data into the build output
│   │   └── src/
│   │       ├── admin/               # scaffold for Admin extensions and their i18n
│   │       ├── api/                 # scaffold for custom store and admin routes
│   │       ├── emails/              # React Email templates and email i18n
│   │       ├── migration-scripts/   # initial-data-seed.ts, its stages, and JSON data
│   │       ├── modules/             # smtp-notification provider
│   │       └── subscribers/         # transactional emails and storefront revalidation
│   └── storefront/                  # Next.js 15 storefront on the App Router
│       ├── messages/                # 36 UI locales
│       ├── public/flags/            # vendored country flags
│       └── src/
│           ├── app/                 # [locale] routes, api/revalidate, llms.txt, sitemap, robots
│           ├── i18n/                # locale config, routing, request
│           ├── lib/                 # data fetching, constants, hooks, utils
│           │   └── geolocation/     # country detection providers
│           ├── middleware.ts        # locale and region resolution
│           └── modules/             # store, products, cart, checkout, account, layout
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

The two apps have their own READMEs: [`apps/backend`](apps/backend/README.md) and [`apps/storefront`](apps/storefront/README.md). Every directory under `apps/backend/src` also keeps the Medusa framework reference for the primitive it holds.

## Requirements

- [Node.js](https://nodejs.org/) v20.19 or later, or v22.12 or later. The backend's `engines` field excludes v21.
- [PostgreSQL](https://www.postgresql.org/) v15 or later
- A package manager: npm, yarn, or [pnpm](https://pnpm.io/). See [Package Managers](#package-managers).
- [Redis](https://redis.io/), optional in development. Development runs the in-memory cache, event bus, and workflow engine unless you set `USE_REDIS=true` alongside `REDIS_URL`. Production uses Redis whenever `REDIS_URL` is set.

### Package Managers

Both apps are ordinary npm packages, so npm, yarn, and pnpm all install and run them. The mapping between the three is the same everywhere in this README:

| Task | pnpm | npm | yarn |
|---|---|---|---|
| Install dependencies | `pnpm install` | `npm install` | `yarn install` |
| Run a package script | `pnpm <script>` | `npm run <script>` | `yarn <script>` |
| Run the Medusa CLI | `pnpm medusa <command>` | `npx medusa <command>` | `yarn medusa <command>` |

The repository itself is a pnpm workspace: [`pnpm-workspace.yaml`](pnpm-workspace.yaml), [`pnpm-lock.yaml`](pnpm-lock.yaml), and a `packageManager` field pinning pnpm 10. The root shortcuts under [Commands](#commands) go through that workspace, so with npm or yarn you install and run each app from its own directory, `apps/backend` and `apps/storefront`. If [Corepack](https://nodejs.org/api/corepack.html) is enabled and refuses to run another package manager because of the pinned `packageManager` field, either stay on pnpm or drop that field from the root [`package.json`](package.json).

## Getting Started

### Install with the Medusa CLI

```bash
# pnpm
pnpm dlx create-medusa-app@latest --repo-url https://github.com/gorgojs/medusa-dtc-starter

# npm
npx create-medusa-app@latest --repo-url https://github.com/gorgojs/medusa-dtc-starter

# yarn
yarn dlx create-medusa-app@latest --repo-url https://github.com/gorgojs/medusa-dtc-starter
```

`--repo-url` scaffolds from this repository instead of the official Medusa starter, and the usual prompts for a project name and database stay the same. The command also runs migrations, creates an admin user, and seeds the database. Pass `--no-migrations` to skip all three.

### Install Manually

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/gorgojs/medusa-dtc-starter.git
   cd medusa-dtc-starter
   pnpm install
   ```

   With npm or yarn, skip this root install and run `npm install` or `yarn install` inside `apps/backend` and `apps/storefront` instead.

2. Create the backend's environment file and point `DATABASE_URL` at a database that exists:

   ```bash
   cp apps/backend/.env.template apps/backend/.env
   ```

   ```bash
   # apps/backend/.env
   DATABASE_URL=postgres://postgres:@localhost:5432/medusa_dtc_starter
   ```

3. Run the migrations, create an admin user, and seed regions, locales, and the demo catalog:

   ```bash
   cd apps/backend
   pnpm medusa db:migrate
   pnpm medusa user -e admin@medusajs.com -p supersecret
   pnpm seed
   ```

   With npm: `npx medusa db:migrate`, `npx medusa user -e admin@medusajs.com -p supersecret`, `npm run seed`. With yarn, drop the `run`: `yarn medusa db:migrate`, `yarn medusa user …`, `yarn seed`.

4. Start the backend and open the Admin at `http://localhost:9000/app`. Log in and copy the publishable API key from **Settings → Publishable API Keys**:

   ```bash
   pnpm dev     # npm run dev, yarn dev
   ```

5. Create the storefront's environment file and paste the key into it:

   ```bash
   cp apps/storefront/.env.template apps/storefront/.env.local
   ```

   ```bash
   # apps/storefront/.env.local
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_6c3...
   ```

6. Start the storefront on `http://localhost:8000`:

   ```bash
   cd apps/storefront
   pnpm dev     # npm run dev, yarn dev
   ```

`pnpm dev` from the repository root starts both apps at once. That shortcut needs the pnpm workspace, so with npm or yarn you start each app from its own directory.

See [Getting Started with Medusa DTC Starter](https://docs.gorgojs.com/tools/medusa-dtc-starter/getting-started) for the full walkthrough, including troubleshooting.

## Configuration

The backend needs a database and an encryption key for integration secrets. Everything else in [`apps/backend/.env.template`](apps/backend/.env.template) ships with working localhost defaults, apart from the SMTP block, which points at a placeholder host until you fill it in:

```bash
# apps/backend/.env
DATABASE_URL=postgres://postgres:@localhost:5432/medusa_dtc_starter
INTEGRATION_ENCRYPTION_KEY=supersecret
```

The storefront needs at least the publishable API key:

```bash
# apps/storefront/.env.local
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_6c3...
```

Both apps document their variables in full: [backend](apps/backend/README.md#environment-variables) and [storefront](apps/storefront/README.md#environment-variables). Replace every `supersecret` value before going to production.

## Seed Data

`pnpm backend:seed` from the repository root, or `pnpm seed` (`npm run seed`, `yarn seed`) from `apps/backend`, seeds the store from JSON files under [`apps/backend/src/migration-scripts/data/`](apps/backend/src/migration-scripts/data) rather than from a generated migration: one file per region, one per locale, plus the demo catalog and shipping options.

The script looks for the sales channel named in `data/store/json/store.json` and skips every stage if it already exists, so edits to the data files take effect on a fresh database. Trim the 241 regions down to your real markets and replace the demo catalog before launch, because each region file creates its own stock location, fulfillment set, and shipping options.

See [Customize Seed Data](https://docs.gorgojs.com/tools/medusa-dtc-starter/customize-seed-data) for the file formats and the rules the seed script follows.

## Add Integrations

The [Integration Module](https://docs.gorgojs.com/medusa-modules/integration) ([`@gorgo/medusa-integration`](https://www.npmjs.com/package/@gorgo/medusa-integration)) is already registered in [`medusa-config.ts`](apps/backend/medusa-config.ts) with an empty `providers` array, so there is nothing to wire up first. Install a payment, fulfillment, or ERP provider from the [Gorgo integrations catalog](https://gorgojs.com/medusa/plugins), add it to `providers`, and configure it under **Settings → Integrations** in the Admin. See [Browse and Add an Integration](https://docs.gorgojs.com/medusa-modules/integration/manage-integrations#browse-and-add-an-integration).

## Commands

Run these from the repository root with pnpm:

| Command | Description |
|---|---|
| `pnpm dev` | Start the backend and the storefront together |
| `pnpm backend:dev` | Start the backend only |
| `pnpm storefront:dev` | Start the storefront only |
| `pnpm backend:seed` | Seed the store, regions, locales, and the demo catalog |
| `pnpm build` | Build both apps |
| `pnpm start` | Start both apps from their builds |
| `pnpm lint` | Lint every app that defines a `lint` task |
| `pnpm test` | Run the `test` task in every app that defines one |

The last two rows come with a caveat each. `pnpm lint` runs `next lint` in the storefront, which loads `next.config.js` and exits when `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is missing from the environment. `pnpm test` currently executes nothing, because neither app defines a `test` task. The backend's suites are `test:unit`, `test:integration:http`, and `test:integration:modules`, and you run them from `apps/backend`.

With npm or yarn, run each app's own scripts instead. `apps/backend` defines `dev`, `build`, `start`, `seed`, `test:unit`, `test:integration:http`, and `test:integration:modules`; `apps/storefront` defines `dev`, `build`, `start`, `lint`, and `analyze`.

## Deployment

Both apps deploy like any Medusa 2 and Next.js pair. A few starter-specific notes:

- The backend's `build` script also runs [`scripts/copy-migration-data.js`](apps/backend/scripts/copy-migration-data.js), which copies the seed JSON into the build output so the seed script can run from a build.
- Set `REDIS_URL` in production. The backend then uses Redis for its cache, event bus, and workflow engine instead of the in-memory defaults.
- Set `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `S3_REGION` to move file uploads to S3-compatible storage in production.
- Add the storefront and Admin origins to `STORE_CORS`, `ADMIN_CORS`, and `AUTH_CORS`, and set `STOREFRONT_URL` so revalidation webhooks and email links point at the real domain.
- On [Medusa Cloud](https://cloud.medusajs.com), set `MEDUSA_CLOUD_S3_HOSTNAME` and `MEDUSA_CLOUD_S3_PATHNAME` in the storefront so Next.js accepts images from the bucket.

## Documentation

- [Production-ready Medusa DTC Starter](https://docs.gorgojs.com/tools/medusa-dtc-starter)
- [Getting Started with Medusa DTC Starter](https://docs.gorgojs.com/tools/medusa-dtc-starter/getting-started)
- [Customize Seed Data](https://docs.gorgojs.com/tools/medusa-dtc-starter/customize-seed-data)
- [Set Up Address Autocomplete](https://docs.gorgojs.com/tools/medusa-dtc-starter/setup-address-autocomplete)
- [Set Up Country Detection](https://docs.gorgojs.com/tools/medusa-dtc-starter/setup-country-detection)
- [Integration Module](https://docs.gorgojs.com/medusa-modules/integration)
- [Medusa documentation](https://docs.medusajs.com)

## Support and Community

Connect with other Medusa developers on Telegram — [@medusajs_chat](https://t.me/medusajs_chat)

More Medusa channels: [GitHub Discussions](https://github.com/medusajs/medusa/discussions), [Discord](https://discord.com/invite/medusajs), [Medusa blog](https://medusajs.com/blog/), [Gorgo blog](https://gorgojs.com/blog/)

## License

MIT — see [LICENSE](LICENSE).

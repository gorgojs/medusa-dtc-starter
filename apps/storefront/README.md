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
  Storefront
</p>

<h4 align="center">
  <a href="https://docs.gorgojs.com/tools/medusa-dtc-starter">Starter documentation</a> |
  <a href="https://dtc-starter-demo.gorgojs.com">Live demo</a> |
  <a href="https://gorgojs.com">Gorgo</a>
</h4>

<p align="center">
  The Next.js storefront of <a href="../../README.md">Medusa DTC Starter by Gorgo</a>: a modal checkout with address autocomplete, a filterable catalog with instant search, 36 UI languages, and SEO with an <code>llms.txt</code> endpoint.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/next--intl-4-1e293b" alt="next-intl 4" />
  <img src="https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
</p>

## What's in This App?

- **Modal checkout** – contacts, address, shipping, and payment each open as a sheet over one screen instead of a multi-page flow, with cart totals and promotion codes alongside. Stripe is wired up through `@stripe/react-stripe-js`; other providers come from the backend's [Integration Module](https://docs.gorgojs.com/medusa-modules/integration).
- **Pluggable address autocomplete** – [`modules/common/components/address-autocomplete`](src/modules/common/components/address-autocomplete) picks a provider from an environment variable. [DaData](https://dadata.ru/?ref=276331) ships built in, anything else falls back to four plain inputs, and the buyer can switch to manual entry at any point. See [Set Up Address Autocomplete](https://docs.gorgojs.com/tools/medusa-dtc-starter/setup-address-autocomplete).
- **Instant search** – a search dialog queries the Store API and highlights matches in the results.
- **Filterable catalog** – option filters, sorting by price and newest, a category and subcategory sidebar, and a bottom sheet on mobile. The selected filters stay in the URL, so a selection can be shared as a link.
- **36 languages and 241 countries** – locales are declared in [`src/i18n/config.ts`](src/i18n/config.ts) with messages in [`messages/`](messages), RTL included. The [middleware](src/middleware.ts) resolves the locale from the URL, a cookie, and the browser's `Accept-Language`. It resolves the region from a cookie, the Cloudflare and Vercel geo headers, and `NEXT_PUBLIC_DEFAULT_REGION`, caching the region map for an hour.
- **Accounts and orders** – login, profile, addresses, order history, order details, and the accept and decline flows for order transfers.
- **SEO and AI optimization** – [`sitemap.ts`](src/app/sitemap.ts) lists every catalog URL in all 36 locales, and [`robots.ts`](src/app/robots.ts) keeps crawlers out of the cart, checkout, account, and API routes. The home, store, product, category, and collection pages carry a canonical URL and hreflang alternates for all 36 locales from [`lib/util/alternates.ts`](src/lib/util/alternates.ts). Open Graph and Twitter images are set, and [`llms.txt`](src/app/llms.txt/route.ts) exposes the catalog to AI crawlers.
- **On-demand revalidation** – [`api/revalidate`](src/app/api/revalidate/route.ts) accepts the backend's webhook, checks the `x-revalidate-secret` header, and revalidates the product, store, category, and collection pages along with the sitemap and `llms.txt`.
- **Vendored country flags** – [`public/flags/4x3`](public/flags/4x3) carries the 241 seeded countries as same-origin SVGs from [flag-icons](https://github.com/lipis/flag-icons) v7.5.0, served `immutable`, with a pinned jsDelivr fallback for anything else.

Pages under `app/[locale]` declare no `generateStaticParams`. The locale and the region come from cookies and request headers, so pages render per request and caching happens in the data layer through fetch tags, which is what the revalidation webhook busts.

## Requirements

- Node.js v20.19+ (or v22.12+), matching the backend
- A running Medusa backend and its publishable API key

## Getting Started

This is an ordinary npm package, so npm, yarn, and pnpm all work. Install dependencies first, either with `pnpm install` at the repository root or with `npm install` or `yarn install` in this directory, then run:

```bash
cp .env.template .env.local         # then set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
pnpm dev                            # npm run dev, yarn dev
```

The storefront runs on `http://localhost:8000`. `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is the only variable the app refuses to start without, because [`check-env-variables.js`](check-env-variables.js) runs from `next.config.js`. Get the key from **Settings → Publishable API Keys** in the Medusa Admin.

## Commands

| Task | pnpm | npm | yarn |
|---|---|---|---|
| Start on port 8000 with Turbopack | `pnpm dev` | `npm run dev` | `yarn dev` |
| Production build (`standalone` output) | `pnpm build` | `npm run build` | `yarn build` |
| Serve the build on port 8000 | `pnpm start` | `npm start` | `yarn start` |
| Run ESLint | `pnpm lint` | `npm run lint` | `yarn lint` |
| Build with the bundle analyzer enabled | `pnpm analyze` | `npm run analyze` | `yarn analyze` |

`lint` and `analyze` load `next.config.js` like a build does, so both need `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in the environment or in `.env.local`.

## Environment Variables

Copy [`.env.template`](.env.template) to `.env.local`. The Default column below is the value the template ships.

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from the Medusa backend. Required | — |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Backend base URL | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Country code (ISO 3166-1 alpha-2, lowercase) the middleware falls back to when neither the cookie nor a geo header resolves a region. The template's `en` matches no seeded region, in which case the first region the backend returns wins | `en` |
| `NEXT_PUBLIC_BASE_URL` | Storefront base URL, used for absolute URLs in metadata, the sitemap, and `llms.txt` | `https://localhost:8000` |
| `NEXT_PUBLIC_SITE_NAME` | Store name in the header, footer, checkout, `schema.org` markup, and `llms.txt` | `Gorgo Medusa Store` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key, only needed when paying through Stripe | — |
| `NEXT_PUBLIC_ADDRESS_AUTOCOMPLETE_PROVIDER` | Address autocomplete provider; `dadata`, or anything else for manual entry | `dadata` |
| `NEXT_PUBLIC_ADDRESS_AUTOCOMPLETE_PROVIDER_API_KEY` | API token for the address autocomplete provider | — |
| `REVALIDATE_SECRET` | Shared secret checked on `api/revalidate`; must match the backend's value | `supersecret` |
| `MEDUSA_CLOUD_S3_HOSTNAME`, `MEDUSA_CLOUD_S3_PATHNAME` | Add the Medusa Cloud bucket to the allowed image hosts | — |
| `NODE_ENV` | Node environment | `development` |

## Project Structure

```
apps/storefront/
├── check-env-variables.js        # fails the build when the publishable key is missing
├── next.config.js                # standalone output, next-intl, image hosts, flag caching
├── messages/                     # 36 UI locales
├── public/flags/                 # 241 vendored country flags
└── src/
    ├── app/
    │   ├── [locale]/(main)/      # home, store, categories, collections, products, cart, account, order
    │   ├── [locale]/(checkout)/  # checkout
    │   ├── api/revalidate/       # webhook endpoint for backend cache invalidation
    │   ├── llms.txt/             # catalog feed for AI crawlers
    │   ├── sitemap.ts            # every catalog URL in all 36 locales
    │   └── robots.ts
    ├── i18n/                     # locale list, routing, request config
    ├── lib/                      # data fetching, constants, hooks, utils
    ├── middleware.ts             # locale and region resolution
    ├── modules/                  # store, products, cart, checkout, account, layout, common
    └── styles/
```

## Documentation

- [Production-ready Medusa DTC Starter](https://docs.gorgojs.com/tools/medusa-dtc-starter)
- [Getting Started with Medusa DTC Starter](https://docs.gorgojs.com/tools/medusa-dtc-starter/getting-started)
- [Set Up Address Autocomplete](https://docs.gorgojs.com/tools/medusa-dtc-starter/setup-address-autocomplete)
- [Medusa storefront development](https://docs.medusajs.com/resources/storefront-development)

## Support and Community

Connect with other Medusa developers on Telegram — [@medusajs_chat](https://t.me/medusajs_chat)

More Medusa channels: [GitHub Discussions](https://github.com/medusajs/medusa/discussions), [Discord](https://discord.com/invite/medusajs), [Medusa blog](https://medusajs.com/blog/), [Gorgo blog](https://gorgojs.com/blog/)

## License

MIT — see [LICENSE](../../LICENSE).

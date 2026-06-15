import { MetadataRoute } from "next"
import { sdk } from "@lib/config"
import { getBaseURL } from "@lib/util/env"
import { listRegions } from "@lib/data/regions"
import { locales } from "@i18n/config"

const BASE_URL = getBaseURL().replace(/\/$/, "")

function url(countryCode: string, locale: string, path: string) {
  return `${BASE_URL}/${countryCode}/${locale}${path}`
}

async function getCountryCodes(): Promise<string[]> {
  try {
    const regions = await listRegions()
    return regions
      .flatMap((r) => r.countries?.map((c) => c.iso_2) ?? [])
      .filter(Boolean) as string[]
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  const countryCodes = await getCountryCodes()
  if (countryCodes.length === 0) return entries

  const staticRoutes = [
    { path: "/", priority: 1.0 },
    { path: "/store", priority: 0.9 },
  ]

  const now = new Date()

  for (const countryCode of countryCodes) {
    for (const locale of locales) {
      for (const { path, priority } of staticRoutes) {
        entries.push({
          url: url(countryCode, locale, path),
          lastModified: now,
          changeFrequency: "weekly",
          priority,
        })
      }
    }
  }

  try {
    let offset = 0
    const limit = 100

    while (true) {
      const { products, count } = await sdk.client.fetch<{
        products: Array<{ handle?: string; updated_at?: string }>
        count: number
      }>("/store/products", {
        query: { limit, offset, fields: "handle,updated_at" },
        next: { tags: ["products"] },
        cache: "force-cache",
      })

      for (const product of products) {
        if (!product.handle) continue
        for (const countryCode of countryCodes) {
          for (const locale of locales) {
            entries.push({
              url: url(countryCode, locale, `/products/${product.handle}`),
              lastModified: product.updated_at ? new Date(product.updated_at) : now,
              changeFrequency: "weekly",
              priority: 0.8,
            })
          }
        }
      }

      offset += limit
      if (offset >= count) break
    }
  } catch {}

  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: Array<{ handle?: string; updated_at?: string }>
    }>("/store/product-categories", {
      query: { fields: "handle,updated_at", limit: 500 },
      next: { tags: ["categories"] },
      cache: "force-cache",
    })

    for (const category of product_categories) {
      if (!category.handle) continue
      for (const countryCode of countryCodes) {
        for (const locale of locales) {
          entries.push({
            url: url(countryCode, locale, `/categories/${category.handle}`),
            lastModified: category.updated_at ? new Date(category.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.75,
          })
        }
      }
    }
  } catch {}

  try {
    const { collections } = await sdk.client.fetch<{
      collections: Array<{ handle?: string; updated_at?: string }>
    }>("/store/collections", {
      query: { fields: "handle,updated_at", limit: 100 },
      next: { tags: ["collections"] },
      cache: "force-cache",
    })

    for (const collection of collections) {
      if (!collection.handle) continue
      for (const countryCode of countryCodes) {
        for (const locale of locales) {
          entries.push({
            url: url(countryCode, locale, `/collections/${collection.handle}`),
            lastModified: collection.updated_at ? new Date(collection.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
          })
        }
      }
    }
  } catch {}

  return entries
}

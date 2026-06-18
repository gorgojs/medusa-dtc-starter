import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { buildAlternates } from "@lib/util/alternates"
import { getCountryCode } from "@lib/data/cookies"
import type { StoreCollection } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations, getLocale } from "next-intl/server"
import { DEFAULT_REGION } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await listCollections({ fields: "*products" })

  if (!collections) return []

  return collections
    .filter((c: StoreCollection) => c.handle)
    .map((c: StoreCollection) => ({ handle: c.handle }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, locale] = await Promise.all([props.params, getLocale()])
  const [t, collection] = await Promise.all([
    getTranslations("Metadata.collections"),
    getCollectionByHandle(params.handle),
  ])

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} ${t("titleSuffix")}`,
    description: `${collection.title} collection`,
    alternates: buildAlternates(locale, `/collections/${params.handle}`),
  }
}

export default async function CollectionPage(props: Props) {
  const [params, searchParams, countryCode] = await Promise.all([
    props.params,
    props.searchParams,
    getCountryCode(),
  ])

  const { sortBy, page, ...rest } = searchParams

  const optionFilters: Record<string, string> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith("option_") && typeof value === "string") {
      optionFilters[key.slice(7)] = value
    }
  }

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy as SortOptions | undefined}
      countryCode={countryCode ?? DEFAULT_REGION}
      optionFilters={optionFilters}
    />
  )
}

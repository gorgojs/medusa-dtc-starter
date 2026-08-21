import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle } from "@lib/data/collections"
import { buildAlternates } from "@lib/util/alternates"
import { getCountryCode } from "@lib/data/cookies"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import CollectionTemplate from "@modules/collections/templates"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getLocale } from "next-intl/server"
import { DEFAULT_REGION, SITE_NAME } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      page?: string
      sortBy?: SortOptions
      optionValueIds?: string | string[]
    }
  >
}

export const PRODUCT_LIMIT = 12

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, locale] = await Promise.all([props.params, getLocale()])
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} | ${SITE_NAME}`,
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

  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={countryCode ?? DEFAULT_REGION}
      optionValueIds={optionValueIds}
    />
  )
}

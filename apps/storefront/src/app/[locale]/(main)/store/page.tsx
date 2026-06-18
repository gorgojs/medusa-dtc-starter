import type { Metadata } from "next"

import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { buildAlternates } from "@lib/util/alternates"
import { getCountryCode } from "@lib/data/cookies"
import { getTranslations, getLocale } from "next-intl/server"

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations("Metadata.store"),
    getLocale(),
  ])
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/store"),
  }
}

export default async function StorePage(props: Params) {
  const searchParams = await props.searchParams
  const countryCode = await getCountryCode()
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={countryCode ?? ""}
    />
  )
}

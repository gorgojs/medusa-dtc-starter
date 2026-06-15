import type { Metadata } from "next"

import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { buildAlternates } from "@lib/util/alternates"
import { getTranslations, getLocale } from "next-intl/server"

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { countryCode } = await params
  const [t, locale] = await Promise.all([
    getTranslations("Metadata.store"),
    getLocale(),
  ])
  return {
    title: t("title"),
    description: t("description"),
    alternates: await buildAlternates(countryCode, locale, "/store"),
  }
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import type { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.flatMap((r) => r.countries?.map((c) => c.iso_2))
  )

  const categoryHandles = product_categories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle
  )

  const staticParams = countryCodes
    ?.flatMap((countryCode: string | undefined) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        category: [handle],
      }))
    )

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations("Metadata.categories")
  try {
    const productCategory = await getCategoryByHandle(params.category)
    const title = `${productCategory.name} ${t("titleSuffix")}`
    const description =
      productCategory.description ?? `${productCategory.name}.`

    return {
      title,
      description,
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params

  const { sortBy, page, ...rest } = searchParams

  const optionFilters: Record<string, string> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith("option_") && typeof value === "string") {
      optionFilters[key.slice(7)] = value
    }
  }

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy as SortOptions | undefined}
      page={page}
      countryCode={params.countryCode}
      optionFilters={optionFilters}
    />
  )
}

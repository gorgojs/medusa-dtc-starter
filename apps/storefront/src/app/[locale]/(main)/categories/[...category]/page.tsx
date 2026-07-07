import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { buildAlternates } from "@lib/util/alternates"
import { getCountryCode } from "@lib/data/cookies"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import type { HttpTypes } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations, getLocale } from "next-intl/server"
import { DEFAULT_REGION } from "@lib/util/env"

type Props = {
  params: Promise<{ category: string[] }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) return []

  return product_categories
    .filter((c: HttpTypes.StoreProductCategory) => c.handle)
    .map((c: HttpTypes.StoreProductCategory) => ({ category: [c.handle] }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const [t, locale, productCategory] = await Promise.all([
      getTranslations("Metadata.categories"),
      getLocale(),
      getCategoryByHandle(params.category),
    ])
    const title = `${productCategory.name} ${t("titleSuffix")}`
    const description =
      productCategory.description ?? `${productCategory.name}.`
    const categoryPath = `/categories/${params.category.join("/")}`

    return {
      title,
      description,
      alternates: buildAlternates(locale, categoryPath),
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const [params, searchParams, countryCode] = await Promise.all([
    props.params,
    props.searchParams,
    getCountryCode(),
  ])

  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode ?? DEFAULT_REGION}
      optionValueIds={optionValueIds}
    />
  )
}

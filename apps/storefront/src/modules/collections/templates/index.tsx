import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortSelect from "@modules/store/components/sort-select"
import OptionFilters from "@modules/store/components/option-filters"
import CategorySidebar from "@modules/store/components/category-sidebar"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { listCategories } from "@lib/data/categories"
import { getOptionsForCollection } from "@lib/data/products"
import type { HttpTypes } from "@medusajs/types"
import { TriangleRightMini } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionFilters,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionFilters?: Record<string, string>
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [t, categories, availableOptions] = await Promise.all([
    getTranslations(),
    listCategories(),
    getOptionsForCollection({ collectionId: collection.id, countryCode }),
  ])

  return (
    <div className="flex flex-col py-6 content-container">
      <nav className="flex items-center gap-1 text-sm text-ui-fg-muted mb-8">
        <LocalizedClientLink
          href="/"
          className="hover:text-ui-fg-base transition-colors"
        >
          {t("Breadcrumb.home")}
        </LocalizedClientLink>
        <TriangleRightMini />
        <LocalizedClientLink
          href="/store"
          className="hover:text-ui-fg-base transition-colors"
        >
          {t("Breadcrumb.store")}
        </LocalizedClientLink>
        <TriangleRightMini />
        <span className="text-ui-fg-base">{collection.title}</span>
      </nav>

      <div className="grid grid-cols-[280px_1fr] items-center justify-between mb-8">
        <h1 className="h3-webs">{collection.title}</h1>
        <div className="flex justify-between w-full">
          {availableOptions.length > 0 && (
            <div className="flex items-center gap-3">
              <OptionFilters options={availableOptions} />
            </div>
          )}
          <SortSelect sortBy={sort} />
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr]">
        <CategorySidebar categories={categories} />
        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
              optionFilters={optionFilters}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

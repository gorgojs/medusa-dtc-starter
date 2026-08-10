import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import type { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import CategorySidebar from "@modules/store/components/category-sidebar"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { listCategories } from "@lib/data/categories"
import { listProductOptionFilters } from "@lib/data/products"
import type { HttpTypes } from "@medusajs/types"
import Breadcrumb from "@modules/common/components/breadcrumb"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [t, categories, optionFilters] = await Promise.all([
    getTranslations(),
    listCategories(),
    listProductOptionFilters({ collection_id: [collection.id] }),
  ])

  return (
    <div className="flex flex-col py-6 content-container">
      <Breadcrumb
        items={[
          { label: t("Breadcrumb.home"), href: "/" },
          { label: t("Breadcrumb.store"), href: "/store" },
          { label: collection.title },
        ]}
      />

      <div className="mb-8 lg:grid lg:grid-cols-[280px_1fr] lg:items-center">
        <h1 className="h3-webs">{collection.title}</h1>
        <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
          <RefinementList
            sortBy={sort}
            display="filters"
            optionFilters={optionFilters}
          />
          <RefinementList
            sortBy={sort}
            display="sort"
            data-testid="sort-by-container"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
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
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

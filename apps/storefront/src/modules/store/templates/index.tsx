import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import type { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import CategorySidebar from "@modules/store/components/category-sidebar"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"
import { TriangleRightMini } from "@medusajs/icons"
import { Link } from "@i18n/navigation"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const [t, categories] = await Promise.all([
    getTranslations(),
    listCategories(),
  ])

  return (
    <div
      className="flex flex-col py-6 content-container"
      data-testid="category-container"
    >
      <nav className="flex items-center gap-1 text-sm text-ui-fg-muted mb-8">
        <Link href={`/`} className="hover:text-ui-fg-base transition-colors">
          {t("Breadcrumb.home")}
        </Link>
        <TriangleRightMini />
        <span className="text-ui-fg-base">{t("Breadcrumb.store")}</span>
      </nav>

      <div className="mb-8 lg:grid lg:grid-cols-[280px_1fr] lg:items-center">
        <h1 className="h3-webs" data-testid="store-page-title">
          {t("Store.allProducts")}
        </h1>
        <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
          <RefinementList sortBy={sort} display="filters" />
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
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate

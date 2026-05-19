import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortSelect from "@modules/store/components/sort-select"
import CategorySidebar from "@modules/store/components/category-sidebar"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"
import { TriangleRightMini } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const categories = await listCategories()

  return (
    <div
      className="flex flex-col py-6 content-container"
      data-testid="category-container"
    >
      <nav className="flex items-center gap-1 text-sm text-ui-fg-muted mb-4">
        <LocalizedClientLink
          href={`/`}
          className="hover:text-ui-fg-base transition-colors"
        >
          Home
        </LocalizedClientLink>
        <TriangleRightMini />
        <span className="text-ui-fg-base">Store</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="h3-webs" data-testid="store-page-title">
          All products
        </h1>
        <SortSelect sortBy={sort} />
      </div>

      <div className="flex flex-col small:flex-row small:items-start">
        <CategorySidebar categories={categories} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate

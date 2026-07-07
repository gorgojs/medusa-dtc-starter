import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import type { OptionValueIds } from "@lib/util/product-option-filters"
import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"
import CategorySidebar from "@modules/store/components/category-sidebar"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { listCategories } from "@lib/data/categories"
import type { HttpTypes } from "@medusajs/types"
import { TriangleRightMini } from "@medusajs/icons"
import { Link } from "@i18n/navigation"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const [t, categories] = await Promise.all([
    getTranslations(),
    listCategories(),
  ])

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)
  const breadcrumbs = [...parents].reverse()

  return (
    <div
      className="flex flex-col py-6 content-container"
      data-testid="category-container"
    >
      <nav className="flex items-center gap-1 text-sm text-ui-fg-muted mb-8">
        <Link href="/" className="hover:text-ui-fg-base transition-colors">
          {t("Breadcrumb.home")}
        </Link>
        <TriangleRightMini />
        <Link
          href={`/store`}
          className="hover:text-ui-fg-base transition-colors"
        >
          {t("Breadcrumb.store")}
        </Link>
        {breadcrumbs.map((parent) => (
          <span key={parent.id} className="flex items-center gap-2">
            <TriangleRightMini />
            <Link
              href={`/categories/${parent.handle}`}
              className="hover:text-ui-fg-base transition-colors"
            >
              {parent.name}
            </Link>
          </span>
        ))}
        <TriangleRightMini />
        <span className="text-ui-fg-base">{category.name}</span>
      </nav>

      <div className="mb-8 lg:grid lg:grid-cols-[280px_1fr] lg:items-center">
        <h1 className="h3-webs" data-testid="category-page-title">
          {category.name}
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
        <CategorySidebar
          categories={categories}
          activeCategoryId={category.id}
        />
        <div className="w-full">
          {category.description && (
            <div className="mb-8 text-base-regular">
              <p>{category.description}</p>
            </div>
          )}
          {category.category_children &&
            category.category_children.length > 0 && (
              <div className="mb-8 text-base-large">
                <ul className="grid grid-cols-1 gap-2">
                  {category.category_children.map((c) => (
                    <li key={c.id}>
                      <InteractiveLink href={`/categories/${c.handle}`}>
                        {c.name}
                      </InteractiveLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

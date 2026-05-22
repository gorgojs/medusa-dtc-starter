import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortSelect from "@modules/store/components/sort-select"
import OptionFilters from "@modules/store/components/option-filters"
import CategorySidebar from "@modules/store/components/category-sidebar"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { listCategories } from "@lib/data/categories"
import { getOptionsForCategory } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { TriangleRightMini } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionFilters,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionFilters?: Record<string, string>
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const [t, categories, availableOptions] = await Promise.all([
    getTranslations(),
    listCategories(),
    getOptionsForCategory({ categoryId: category.id, countryCode }),
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
        <LocalizedClientLink
          href="/"
          className="hover:text-ui-fg-base transition-colors"
        >
          {t("Breadcrumb.home")}
        </LocalizedClientLink>
        <TriangleRightMini />
        <LocalizedClientLink
          href={`/store`}
          className="hover:text-ui-fg-base transition-colors"
        >
          {t("Breadcrumb.store")}
        </LocalizedClientLink>
        {breadcrumbs.map((parent) => (
          <span key={parent.id} className="flex items-center gap-2">
            <TriangleRightMini />
            <LocalizedClientLink
              href={`/categories/${parent.handle}`}
              className="hover:text-ui-fg-base transition-colors"
            >
              {parent.name}
            </LocalizedClientLink>
          </span>
        ))}
        <TriangleRightMini />
        <span className="text-ui-fg-base">{category.name}</span>
      </nav>

      <div className="grid grid-cols-[280px_1fr] items-center justify-between mb-8">
        <h1 className="h3-webs" data-testid="category-page-title">
          {category.name}
        </h1>
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
              optionFilters={optionFilters}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

type CategorySidebarProps = {
  categories: HttpTypes.StoreProductCategory[]
  activeCategoryId?: string
}

const CategorySidebar = ({
  categories,
  activeCategoryId,
}: CategorySidebarProps) => {
  const topLevel = categories.filter((c) => !c.parent_category_id)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1">
        {topLevel.map((category) => (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle}`}
            className={clx(
              "txt-compact-small text-ui-fg-base hover:text-ui-fg-base transition-colors w-full px-2 py-1",
              {
                "text-ui-fg-base font-medium": category.id === activeCategoryId,
              }
            )}
          >
            {category.name}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default CategorySidebar

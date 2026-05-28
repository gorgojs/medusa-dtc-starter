import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { clsx } from "clsx"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  const COLOR_MAP: Record<string, string> = {
    Чёрный: "#111111",
    Белый: "#ffffff",
    Серый: "#9ca3af",
    Синий: "#3b82f6",
    Красный: "#ef4444",
    Зелёный: "#22c55e",
    Жёлтый: "#eab308",
    Розовый: "#ec4899",
  }

  const sizeOptions =
    product.options
      ?.find((o) => o.title === "Размер" || o.title === "Size")
      ?.values?.map((v) => v.value) ?? []

  const colorOptions =
    product.options
      ?.find((o) => o.title === "Цвет" || o.title === "Color")
      ?.values?.map((v) => v.value) ?? []

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-base" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
        <div className="flex txt-compact-2xsmall-plus mt-1 justify-between text-ui-tag-neutral-text">
          {sizeOptions.length > 0 && (
            <div className="flex">
              {sizeOptions.map((option) => (
                <div key={option} className="first:pl-0 px-2">
                  {option}
                </div>
              ))}
            </div>
          )}
          {colorOptions.length > 0 && (
            <div className="flex items-center gap-x-2">
              {colorOptions.map((color) => (
                <span
                  key={color}
                  title={color}
                  className={clsx(
                    color === "Белый" && "border",
                    "size-3 rounded-full inline-block"
                  )}
                  style={{ backgroundColor: COLOR_MAP[color] ?? "#d1d5db" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

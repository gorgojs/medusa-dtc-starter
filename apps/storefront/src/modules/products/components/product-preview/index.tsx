import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import type { HttpTypes } from "@medusajs/types"
import { Link } from "@i18n/navigation"
import {
  isColorOption,
  isSizeOption,
  resolveColorHex,
  WHITE_HEX,
} from "@lib/util/color-map"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { clsx } from "clsx"
import { getLocale } from "next-intl/server"

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

  const locale = await getLocale()
  const { cheapestPrice } = getProductPrice({
    product,
    locale,
  })

  const sizeOptions =
    product.options
      ?.find((o) => isSizeOption(o.title ?? ""))
      ?.values?.map((v) => v.value) ?? []

  const colorOptions =
    product.options
      ?.find((o) => isColorOption(o.title ?? ""))
      ?.values?.map((v) => v.value) ?? []

  return (
    <Link href={`/products/${product.handle}`} className="group">
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
              {colorOptions.map((color) => {
                const hex = resolveColorHex(color)
                return (
                  <span
                    key={color}
                    title={color}
                    className={clsx(
                      hex === WHITE_HEX && "border",
                      "size-3 rounded-full inline-block"
                    )}
                    style={{ backgroundColor: hex }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

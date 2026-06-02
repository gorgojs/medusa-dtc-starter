import { clx } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import type { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col">
      <span
        className={clx(
          "text-2xl font-medium leading-[125%] tracking-[-0.0096em] text-[#18181B]",
          {
            "text-[#18181B]": selectedPrice.price_type !== "sale",
          }
        )}
      >
        {!variant && "От "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <div className="flex items-center gap-x-2 mt-1">
          <span
            className="text-sm line-through text-[#71717A]"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          <span className="text-sm text-[#18181B]">
            -{selectedPrice.percentage_diff}%
          </span>
        </div>
      )}
    </div>
  )
}

import type { HttpTypes } from "@medusajs/types"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-2">
      <h1
        className="text-[32px] font-medium leading-[160%] text-[#18181B]"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      {product.subtitle && (
        <p className="text-sm leading-[160%] text-[#52525B]">
          {product.subtitle}
        </p>
      )}
    </div>
  )
}

export default ProductInfo

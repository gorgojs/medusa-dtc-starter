import type React from "react"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { Link } from "@i18n/navigation"
import { notFound } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
  images,
}) => {
  const t = await getTranslations("")

  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col gap-y-6 py-6"
        data-testid="product-container"
      >
        <nav className="flex items-center gap-x-2 text-xs text-zinc-500 font-medium">
          <Link
            href="/"
            className="hover:text-zinc-800 transition-colors"
          >
            {t("Breadcrumb.home")}
          </Link>
          <span className="text-zinc-400">›</span>
          {product.collection && (
            <>
              <Link
                href={`/collections/${product.collection.handle}`}
                className="hover:text-zinc-800 transition-colors"
              >
                {product.collection.title}
              </Link>
              <span className="text-zinc-400">›</span>
            </>
          )}
          <span className="text-zinc-800">{product.title}</span>
        </nav>

        <div className="flex flex-col small:flex-row gap-x-8 items-start">
          <div className="flex-1 w-full">
            <ImageGallery images={images} />
          </div>

          <div className="flex flex-col small:sticky small:top-14 small:w-[320px] w-full gap-y-6 py-8 small:py-0 shrink-0">
            <ProductInfo product={product} />
            <ProductOnboardingCta />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate

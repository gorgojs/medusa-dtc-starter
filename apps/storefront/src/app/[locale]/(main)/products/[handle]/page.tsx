import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { buildAlternates } from "@lib/util/alternates"
import { getCountryCode } from "@lib/data/cookies"
import ProductTemplate from "@modules/products/templates"
import type { HttpTypes } from "@medusajs/types"
import { getLocale } from "next-intl/server"
import { defaultLocale } from "@i18n/config"
import { DEFAULT_REGION } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const { products } = await listProducts({
      countryCode: DEFAULT_REGION,
      queryParams: { limit: 100, fields: "handle" },
    }).then((r) => r.response)

    return products
      .filter((p) => p.handle)
      .map((p) => ({ handle: p.handle }))
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, countryCode, locale] = await Promise.all([
    props.params,
    getCountryCode(),
    getLocale(),
  ])

  const cc = countryCode ?? DEFAULT_REGION
  const { handle } = params
  const region = await getRegion(cc)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: cc,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const strMeta = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined

  const rawTitle =
    strMeta(meta[`seo_title.${locale}`]) ??
    strMeta(meta.seo_title) ??
    product.title
  const title = rawTitle ? `${rawTitle} | Medusa Store` : "Medusa Store"

  const rawDescription =
    strMeta(meta[`seo_description.${locale}`]) ??
    strMeta(meta.seo_description) ??
    product.description ??
    product.subtitle
  const description = rawDescription
    ?.replace(/<[^>]*>/g, "")
    .slice(0, 160)

  return {
    title,
    description,
    alternates: buildAlternates(locale, `/products/${handle}`),
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const [params, countryCode, searchParams] = await Promise.all([
    props.params,
    getCountryCode(),
    props.searchParams,
  ])

  const cc = countryCode ?? DEFAULT_REGION
  const region = await getRegion(cc)
  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: cc,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={cc}
      images={images ?? []}
    />
  )
}

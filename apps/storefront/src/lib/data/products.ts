"use server"

import { sdk } from "@lib/config"
import type { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import type { HttpTypes } from "@medusajs/types"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

export type ProductOptionFilterValue = {
  label: string
  ids: string[]
}

export type ProductOptionFilterGroup = {
  title: string
  values: ProductOptionFilterValue[]
}

/**
 * Builds the option filter groups for the catalog from the products themselves.
 *
 * Options are per-product, so the same logical value (e.g. "Чёрный") exists as
 * a separate option-value row per product. We fetch products via /store/products
 * (which applies translations for the current locale), group options by their
 * translated title and values by their translated label, and collect every
 * matching value id. Filtering by those ids happens in `listProductsWithSort`
 * (the API's `option_value_id` filter groups ids by option_id, which doesn't
 * work with per-product options).
 */
export const listProductOptionFilters = async (
  queryParams?: Pick<ProductListQueryParams, "category_id" | "collection_id">
): Promise<ProductOptionFilterGroup[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  const { products } = await sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      query: {
        limit: 100,
        fields: "id,options.id,options.title,options.values.id,options.values.value",
        ...queryParams,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .catch(() => ({ products: [] as HttpTypes.StoreProduct[] }))

  const groups = new Map<string, Map<string, string[]>>()

  for (const product of products) {
    for (const option of product.options ?? []) {
      if (!option.title) continue
      let values = groups.get(option.title)
      if (!values) {
        values = new Map()
        groups.set(option.title, values)
      }
      for (const optionValue of option.values ?? []) {
        if (!optionValue.value || !optionValue.id) continue
        const ids = values.get(optionValue.value)
        if (ids) {
          ids.push(optionValue.id)
        } else {
          values.set(optionValue.value, [optionValue.id])
        }
      }
    }
  }

  return Array.from(groups, ([title, values]) => ({
    title,
    values: Array.from(values, ([label, ids]) => ({ label, ids })),
  }))
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const selectedValueIds = new Set((optionValueIds || []).filter(Boolean))

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  // Filter by option values on the server: options are per-product, so one
  // displayed value maps to several option-value ids (one per product). We
  // group the selected ids by logical option group (title) and keep products
  // that have a variant matching at least one selected value from EVERY
  // group — OR within a group, AND across groups.
  let filteredProducts = products
  if (selectedValueIds.size) {
    const groups = await listProductOptionFilters({
      category_id: queryParams?.category_id,
      collection_id: queryParams?.collection_id,
    })

    const selectedIdsByGroup = groups
      .map(
        (group) =>
          new Set(
            group.values
              .flatMap((value) => value.ids)
              .filter((id) => selectedValueIds.has(id))
          )
      )
      .filter((groupIds) => groupIds.size > 0)

    if (selectedIdsByGroup.length) {
      filteredProducts = products.filter((product) =>
        product.variants?.some((variant) =>
          selectedIdsByGroup.every((groupIds) =>
            variant.options?.some(
              (optionValue) => optionValue.id && groupIds.has(optionValue.id)
            )
          )
        )
      )
    }
  }

  const sortedProducts = sortProducts(filteredProducts, sortBy)
  const filteredCount = sortedProducts.length
  const pageParam = (page - 1) * limit
  const nextPage =
    filteredCount > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}

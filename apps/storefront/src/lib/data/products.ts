"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import type { HttpTypes } from "@medusajs/types"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
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
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,",
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

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionFilters,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  optionFilters?: Record<string, string>
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const hasFilters = optionFilters && Object.keys(optionFilters).length > 0

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
      ...(hasFilters && {
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*options,*options.values,*variants.options",
      }),
    },
    countryCode,
  })

  let sortedProducts = sortProducts(products, sortBy)

  if (hasFilters) {
    sortedProducts = sortedProducts.filter((product) =>
      Object.entries(optionFilters!).every(([filterTitle, filterValue]) => {
        const option = product.options?.find(
          (o) => o.title.toLowerCase() === filterTitle.toLowerCase()
        )
        if (!option) return false
        return (
          product.variants?.some((variant) =>
            variant.options?.some(
              (varOpt) =>
                varOpt.option_id === option.id && varOpt.value === filterValue
            )
          ) ?? false
        )
      })
    )
  }

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

export const getOptionsForCollection = async ({
  collectionId,
  countryCode,
}: {
  collectionId: string
  countryCode: string
}): Promise<{ title: string; values: string[] }[]> => {
  const region = await getRegion(countryCode)
  if (!region) return []

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products")) }

  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
  }>(`/store/products`, {
    method: "GET",
    query: {
      limit: 100,
      region_id: region.id,
      collection_id: [collectionId],
      fields: "*options,*options.values",
    },
    headers,
    next,
    cache: "force-cache",
  })

  const optionsMap = new Map<string, Set<string>>()
  for (const product of products) {
    for (const option of product.options ?? []) {
      if (!optionsMap.has(option.title)) {
        optionsMap.set(option.title, new Set())
      }
      for (const val of option.values ?? []) {
        optionsMap.get(option.title)!.add(val.value)
      }
    }
  }

  return Array.from(optionsMap.entries()).map(([title, values]) => ({
    title,
    values: Array.from(values).sort(),
  }))
}

export const getOptionsForCategory = async ({
  categoryId,
  countryCode,
}: {
  categoryId: string
  countryCode: string
}): Promise<{ title: string; values: string[] }[]> => {
  const region = await getRegion(countryCode)
  if (!region) return []

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("products")) }

  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
  }>(`/store/products`, {
    method: "GET",
    query: {
      limit: 100,
      region_id: region.id,
      category_id: [categoryId],
      fields: "*options,*options.values",
    },
    headers,
    next,
    cache: "force-cache",
  })

  const optionsMap = new Map<string, Set<string>>()
  for (const product of products) {
    for (const option of product.options ?? []) {
      if (!optionsMap.has(option.title)) {
        optionsMap.set(option.title, new Set())
      }
      for (const val of option.values ?? []) {
        optionsMap.get(option.title)!.add(val.value)
      }
    }
  }

  return Array.from(optionsMap.entries()).map(([title, values]) => ({
    title,
    values: Array.from(values).sort(),
  }))
}

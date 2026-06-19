"use client"

import Image from "next/image"
import { useState } from "react"
import { updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { Loader } from "@medusajs/icons"
import clsx from "clsx"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageUrl =
    item.thumbnail || item.variant?.product?.images?.[0]?.url || null

  const total = convertToLocale({
    amount: item.total ?? 0,
    currency_code: currencyCode,
  })

  const unitPrice = convertToLocale({
    amount: item.unit_price ?? 0,
    currency_code: currencyCode,
  })

  const variantTitle = item.variant?.title
  const maxQty = 10

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)
    await updateLineItem({ lineId: item.id, quantity })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  if (type === "preview") {
    return (
      <div className="flex items-center gap-x-3" data-testid="product-row">
        <div className="relative flex-shrink-0">
          <LocalizedClientLink href={`/products/${item.product_handle}`}>
            <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-ui-bg-component border border-ui-border-base flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.product_title ?? ""}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <PlaceholderImage size={20} />
              )}
            </div>
          </LocalizedClientLink>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ui-fg-base text-ui-bg-base text-[10px] font-medium flex items-center justify-center leading-none">
            {item.quantity}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-y-0.5">
          <span
            className="txt-compact-medium-plus text-ui-fg-base truncate"
            data-testid="product-title"
          >
            {item.product_title}
          </span>
          {variantTitle && (
            <span className="txt-compact-small text-ui-fg-subtle truncate">
              {variantTitle}
            </span>
          )}
        </div>

        <span className="txt-compact-medium-plus text-ui-fg-base flex-shrink-0">
          {total}
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex gap-x-4 py-4 border-b border-ui-border-base last:border-b-0"
      data-testid="product-row"
    >
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="flex-shrink-0"
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-ui-bg-component border border-ui-border-base flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product_title ?? ""}
              width={80}
              height={80}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <PlaceholderImage size={24} />
          )}
        </div>
      </LocalizedClientLink>

      <div className="flex flex-1 gap-x-4 min-w-0">
        <div className="flex flex-col flex-1 min-w-0 gap-y-1">
          <LocalizedClientLink href={`/products/${item.product_handle}`}>
            <span
              className="txt-compact-medium-plus text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
              data-testid="product-title"
            >
              {item.product_title}
            </span>
          </LocalizedClientLink>
          {variantTitle && (
            <span className="txt-compact-small text-ui-fg-subtle">
              {variantTitle}
            </span>
          )}
          <span className="txt-compact-small text-ui-fg-muted">{unitPrice}</span>

          <div className="flex items-center mt-2 gap-x-3">
            <div className="flex items-center border border-ui-border-base rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  item.quantity > 1 && changeQuantity(item.quantity - 1)
                }
                disabled={updating || item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center txt-compact-medium text-ui-fg-subtle hover:bg-ui-bg-field disabled:opacity-40 transition-colors"
                data-testid="decrease-qty-button"
              >
                −
              </button>
              <span className="w-8 h-8 flex items-center justify-center txt-compact-medium-plus text-ui-fg-base border-x border-ui-border-base">
                {updating ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                type="button"
                onClick={() =>
                  item.quantity < maxQty && changeQuantity(item.quantity + 1)
                }
                disabled={updating || item.quantity >= maxQty}
                className="w-8 h-8 flex items-center justify-center txt-compact-medium text-ui-fg-subtle hover:bg-ui-bg-field disabled:opacity-40 transition-colors"
                data-testid="increase-qty-button"
              >
                +
              </button>
            </div>
            <DeleteButton
              id={item.id}
              data-testid="product-delete-button"
            />
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>

        <div className="flex flex-col items-end justify-start flex-shrink-0">
          <span
            className={clsx("txt-compact-medium-plus text-ui-fg-base")}
            data-testid="product-unit-price"
          >
            {total}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Item

import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

const CheckoutTotals = async ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const t = await getTranslations("CheckoutPage")

  const {
    currency_code,
    total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = cart
  const itemCount = cart.items?.length ?? 0

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col txt-medium text-ui-fg-subtle">
        <div className="flex items-center justify-between">
          <span>{t("itemsCount", { count: itemCount })}</span>
          <span data-testid="cart-subtotal">
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("shippingCost")}</span>
          <span data-testid="cart-shipping">
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>

        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>{t("discount")}</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
            >
              - {convertToLocale({ amount: discount_subtotal, currency_code })}
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-ui-border-base" />

      <div className="flex items-center justify-between">
        <h2 className="h2-docs">{t("total")}</h2>
        <span
          className="txt-xlarge-plus text-ui-fg-base"
          data-testid="cart-total"
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CheckoutTotals

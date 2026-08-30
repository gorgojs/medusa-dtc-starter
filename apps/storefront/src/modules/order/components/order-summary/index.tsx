import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = async ({ order }: OrderSummaryProps) => {
  const t = await getTranslations("OrderSummary")
  const locale = await getLocale()

  const amount = (value?: number | null) =>
    convertToLocale({
      amount: value ?? 0,
      currency_code: order.currency_code,
      locale,
    })

  return (
    <div>
      <h2 className="text-base-semi">{t("heading")}</h2>
      <div className="text-small-regular text-ui-fg-base my-2">
        {/* `subtotal` already carries shipping, so listing it here and then
            adding shipping below counted the same money twice. */}
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>{t("subtotal")}</span>
          <span>{amount(order.item_subtotal)}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between">
              <span>{t("discount")}</span>
              <span>- {amount(order.discount_total)}</span>
            </div>
          )}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between">
              <span>{t("giftCard")}</span>
              <span>- {amount(order.gift_card_total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>{t("shipping")}</span>
            <span>{amount(order.shipping_total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("taxes")}</span>
            <span>{amount(order.tax_total)}</span>
          </div>
        </div>
        <div className="h-px w-full border-b border-gray-200 border-dashed my-4" />
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>{t("total")}</span>
          <span>{amount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary

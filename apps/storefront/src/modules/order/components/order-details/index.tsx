import type { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { formatDate } from "@lib/util/date"
import { getLocale, getTranslations } from "next-intl/server"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
  locale?: string
}

const OrderDetails = async ({
  order,
  showStatus,
  locale: localeProp,
}: OrderDetailsProps) => {
  const t = await getTranslations("OrderDetails")
  const locale = localeProp ?? (await getLocale())

  const formattedOrderDate = formatDate({ date: order.created_at, locale })

  return (
    <div>
      <Text>
        {t("confirmationSentBefore")}{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        {t("orderDate")}{" "}
        <span data-testid="order-date">{formattedOrderDate}</span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        {t("orderNumber")}{" "}
        <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              {t("orderStatus")}{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {t(`fulfillmentStatuses.${order.fulfillment_status}`)}
              </span>
            </Text>
            <Text>
              {t("paymentStatus")}{" "}
              <span
                className="text-ui-fg-subtle "
                data-testid="order-payment-status"
              >
                {t(`paymentStatuses.${order.payment_status}`)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails

import { formatAddressLines, joinFilled } from "@lib/util/address"
import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import { getLocale, getTranslations } from "next-intl/server"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = async ({ order }: ShippingDetailsProps) => {
  const t = await getTranslations("ShippingDetails")
  const locale = await getLocale()

  const addressLines = formatAddressLines(order.shipping_address)
  const contactLines = [order.shipping_address?.phone, order.email].filter(
    Boolean
  ) as string[]

  const shippingMethod = order.shipping_methods?.[0] as
    | { name?: string; total?: number }
    | undefined
  const shippingMethodLabel = shippingMethod
    ? joinFilled(
        [
          shippingMethod.name,
          convertToLocale({
            amount: shippingMethod.total ?? 0,
            currency_code: order.currency_code,
            locale,
          }),
        ],
        " · "
      )
    : ""

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        {t("heading")}
      </Heading>
      <div className="flex items-start gap-x-8">
        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            {t("shippingAddress")}
          </Text>
          {addressLines.map((line) => (
            <Text key={line} className="txt-medium text-ui-fg-subtle">
              {line}
            </Text>
          ))}
        </div>

        <div
          className="flex flex-col w-1/3 "
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            {t("contact")}
          </Text>
          {contactLines.map((line) => (
            <Text key={line} className="txt-medium text-ui-fg-subtle">
              {line}
            </Text>
          ))}
        </div>

        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            {t("method")}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {shippingMethodLabel}
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails

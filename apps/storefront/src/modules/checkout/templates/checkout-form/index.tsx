import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listRegions } from "@lib/data/regions"
import { getCountryCode } from "@lib/data/cookies"
import type { HttpTypes } from "@medusajs/types"
import CheckoutShippingSection from "@modules/checkout/components/checkout-shipping-section"
import CheckoutInfoRows from "@modules/checkout/components/checkout-info-rows"
import CheckoutItemList from "@modules/checkout/components/checkout-item-list"
import SignInPrompt from "@modules/checkout/components/sign-in-prompt"
import { getTranslations } from "next-intl/server"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) return null

  const [shippingMethods, regions, currentCountry, t] = await Promise.all([
    listCartShippingMethods(cart.id),
    listRegions(),
    getCountryCode(),
    getTranslations("CheckoutPage"),
  ])

  const resolvedCountry =
    currentCountry ||
    cart.shipping_address?.country_code ||
    cart.region?.countries?.[0]?.iso_2 ||
    ""

  return (
    <div className="flex flex-col px-4 py-6 lg:pr-10 lg:py-10 lg:pl-0 gap-y-6">
      {!customer && <SignInPrompt />}

      <CheckoutShippingSection
        cart={cart}
        availableShippingMethods={shippingMethods}
        regions={regions ?? []}
        currentCountry={resolvedCountry}
      />

      <div className="h-px bg-ui-border-base" />

      <CheckoutInfoRows cart={cart} customer={customer} />

      <CheckoutItemList cart={cart} />

      <div className="flex gap-x-4 mt-4">
        <a
          href="#"
          className="txt-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
        >
          {t("shippingLink")}
        </a>
        <a
          href="#"
          className="txt-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
        >
          {t("returnsLink")}
        </a>
      </div>
    </div>
  )
}

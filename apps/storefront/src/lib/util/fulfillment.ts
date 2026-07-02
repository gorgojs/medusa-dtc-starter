import type { HttpTypes } from "@medusajs/types"

export const isPickupShippingOption = (
  option?: HttpTypes.StoreCartShippingOptionWithServiceZone | null
) => {
  return option?.service_zone?.fulfillment_set?.type === "pickup"
}

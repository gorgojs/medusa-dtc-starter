import type { HttpTypes } from "@medusajs/types"

export const getOptionValueHex = (
  value: Pick<HttpTypes.StoreProductOptionValue, "metadata">
): string | undefined => {
  const hex = value.metadata?.hex
  return typeof hex === "string" ? hex : undefined
}

export const isColorOption = (
  option: Pick<HttpTypes.StoreProductOption, "values">
): boolean => (option.values ?? []).some((v) => getOptionValueHex(v) !== undefined)

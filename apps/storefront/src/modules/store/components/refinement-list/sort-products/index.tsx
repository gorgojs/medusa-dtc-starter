"use client"

import { Select } from "@medusajs/ui"
import { useTranslations } from "next-intl"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const t = useTranslations("SortSelect")

  const sortOptions = [
    { value: "created_at", label: t("latestArrivals") },
    { value: "price_asc", label: t("priceLowHigh") },
    { value: "price_desc", label: t("priceHighLow") },
  ]

  return (
    <Select
      value={sortBy}
      onValueChange={(value) => setQueryParams("sortBy", value)}
      data-testid={dataTestId}
    >
      <Select.Trigger className="w-[180px] bg-white">
        <Select.Value placeholder={t("placeholder")} />
      </Select.Trigger>
      <Select.Content>
        {sortOptions.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}

export default SortProducts

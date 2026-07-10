"use client"

import NativeSelect from "@modules/common/components/native-select"
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
    <NativeSelect
      value={sortBy}
      onChange={(e) => setQueryParams("sortBy", e.target.value)}
      placeholder={t("placeholder")}
      className="w-[180px]"
      data-testid={dataTestId}
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </NativeSelect>
  )
}

export default SortProducts

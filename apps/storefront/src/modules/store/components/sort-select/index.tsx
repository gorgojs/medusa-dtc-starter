"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import NativeSelect from "@modules/common/components/native-select"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const sortOptions = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const SortSelect = ({ sortBy }: { sortBy: SortOptions }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams)
      params.set("sortBy", e.target.value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  return (
    <NativeSelect
      value={sortBy}
      onChange={handleChange}
      className="min-w-[180px]"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </NativeSelect>
  )
}

export default SortSelect

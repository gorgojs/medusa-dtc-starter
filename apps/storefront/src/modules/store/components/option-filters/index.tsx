"use client"

import NativeSelect from "@modules/common/components/native-select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { useTranslations } from "next-intl"

type OptionFiltersProps = {
  options: { title: string; values: string[] }[]
}

const OptionFilters = ({ options }: OptionFiltersProps) => {
  const t = useTranslations("OptionFilters")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (optionTitle: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      const key = `option_${optionTitle.toLowerCase()}`
      if (value === "__all__") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  if (!options.length) return null

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const key = `option_${option.title.toLowerCase()}`
        const currentValue = searchParams.get(key) ?? "__all__"

        return (
          <NativeSelect
            key={option.title}
            value={currentValue}
            onChange={(e) => handleChange(option.title, e.target.value)}
            placeholder={option.title}
            className="min-w-[140px]"
          >
            <option value="__all__">{t("allValues", { title: option.title })}</option>
            {option.values.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </NativeSelect>
        )
      })}
    </div>
  )
}

export default OptionFilters

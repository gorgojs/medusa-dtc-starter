"use client"

import { useEffect, useMemo, useState } from "react"

import { sdk } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"
import NativeSelect from "@modules/common/components/native-select"
import { useTranslations } from "next-intl"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const t = useTranslations("OptionFilters")
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: {
            is_exclusive: false,
            fields: "*values",
          },
        })

        if (response?.product_options) {
          setOptions(response.product_options)
        }
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [])

  const selectedValueIdsByOptionId = useMemo(() => {
    const result = new Map<string, string>()

    for (const option of options) {
      const selectedValue = option.values?.find(
        (value) => value.id && selectedValueIds.includes(value.id)
      )

      if (option.id && selectedValue?.id) {
        result.set(option.id, selectedValue.id)
      }
    }

    return result
  }, [options, selectedValueIds])

  const handleChange = (
    option: HttpTypes.StoreProductOption,
    valueId: string
  ) => {
    const optionValueIds =
      option.values?.map((value) => value.id).filter(Boolean) ?? []
    const selectedValuesFromOtherOptions = selectedValueIds.filter(
      (selectedValueId) => !optionValueIds.includes(selectedValueId)
    )

    if (valueId === "__all__") {
      setOptionValueIds(selectedValuesFromOtherOptions)
      return
    }

    setOptionValueIds([...selectedValuesFromOtherOptions, valueId])
  }

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const values =
          option.values
            ?.map((value) => ({
              id: value.id,
              label: value.value,
            }))
            .filter(
              (value): value is { id: string; label: string } =>
                !!value.id && !!value.label
            ) || []

        if (!option.id || !values.length) {
          return null
        }

        return (
          <NativeSelect
            key={option.id}
            value={selectedValueIdsByOptionId.get(option.id) ?? "__all__"}
            onChange={(e) => handleChange(option, e.target.value)}
            placeholder={option.title ?? undefined}
            className="w-[180px]"
          >
            <option value="__all__">
              {t("allValues", { title: option.title ?? "" })}
            </option>
            {values.map((value) => (
              <option key={value.id} value={value.id}>
                {value.label}
              </option>
            ))}
          </NativeSelect>
        )
      })}
    </div>
  )
}

export default OptionsPicker

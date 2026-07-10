"use client"

import { useMemo } from "react"

import type {
  ProductOptionFilterGroup,
  ProductOptionFilterValue,
} from "@lib/data/products"
import { ChevronUpDown } from "@medusajs/icons"
import { Checkbox, DropdownMenu, Label } from "@medusajs/ui"
import { useTranslations } from "next-intl"

type OptionsPickerProps = {
  options: ProductOptionFilterGroup[]
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  options,
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const t = useTranslations("OptionFilters")

  const selectedSet = useMemo(
    () => new Set(selectedValueIds),
    [selectedValueIds]
  )

  const isValueSelected = (value: ProductOptionFilterValue) =>
    value.ids.some((id) => selectedSet.has(id))

  const toggleValue = (value: ProductOptionFilterValue) => {
    if (isValueSelected(value)) {
      const valueIds = new Set(value.ids)
      setOptionValueIds(selectedValueIds.filter((id) => !valueIds.has(id)))
      return
    }

    setOptionValueIds([...selectedValueIds, ...value.ids])
  }

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((group) => {
        if (!group.values.length) {
          return null
        }

        const selectedLabels = group.values
          .filter((value) => isValueSelected(value))
          .map((value) => value.label)

        return (
          <DropdownMenu key={group.title}>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="w-[180px] flex items-center justify-between gap-x-2 txt-compact-small-plus border border-ui-border-base bg-ui-bg-subtle rounded-md hover:bg-ui-bg-field-hover px-2 py-1 outline-none"
              >
                <span className="truncate">
                  {selectedLabels.length
                    ? selectedLabels.join(", ")
                    : t("allValues", { title: group.title })}
                </span>
                <ChevronUpDown className="text-ui-fg-muted shrink-0" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content align="start" className="w-[220px] p-2">
              <div className="flex flex-col gap-2">
                {group.values.map((value) => (
                  <Label
                    key={value.label}
                    className="rounded-lg cursor-pointer transition-colors bg-ui-bg-base-hover lg:bg-ui-bg-subtle-hover hover:bg-ui-bg-base-pressed"
                  >
                    <div className="flex items-center">
                      <Checkbox
                        className="size-8 cursor-pointer"
                        checked={isValueSelected(value)}
                        onCheckedChange={() => toggleValue(value)}
                      />
                      <div className="text-sm truncate text-ui-fg-subtle px-2 flex items-center flex-1">
                        {value.label}
                      </div>
                    </div>
                  </Label>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu>
        )
      })}
    </div>
  )
}

export default OptionsPicker

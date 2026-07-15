"use client"

import { useMemo } from "react"

import type { ProductOptionFilterGroup } from "@lib/data/products"
import FilterCombobox from "../filter-combobox"

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
  const selectedSet = useMemo(
    () => new Set(selectedValueIds),
    [selectedValueIds]
  )

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-row gap-2">
      {options.map((group) => {
        if (!group.values.length) {
          return null
        }

        const groupValueIds = group.values.map((value) => value.id)
        const selectedInGroup = groupValueIds.filter((id) => selectedSet.has(id))

        // Replace this group's selection, keeping other groups' ids intact.
        const setGroupValueIds = (ids: string[]) => {
          const groupIds = new Set(groupValueIds)
          setOptionValueIds([
            ...selectedValueIds.filter((id) => !groupIds.has(id)),
            ...ids,
          ])
        }

        return (
          <FilterCombobox
            className="max-w-[180px]"
            key={group.id}
            label={group.title}
            value={selectedInGroup}
            onChange={setGroupValueIds}
            options={group.values.map((value) => ({
              value: value.id,
              label: value.label,
            }))}
            allowClear={selectedInGroup.length > 0}
          />
        )
      })}
    </div>
  )
}

export default OptionsPicker

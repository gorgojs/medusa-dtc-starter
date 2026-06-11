import type { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { COLOR_MAP, isColorOption } from "@lib/util/color-map"
import type React from "react"
import clsx from "clsx"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const isColor = isColorOption(title)

  return (
    <div className="flex flex-col gap-y-2">
      <span className="txt-large text-ui-fg-base">{title}</span>
      <div
        className={clsx(
          isColor
            ? "flex flex-wrap"
            : "grid grid-cols-[repeat(auto-fit,_minmax(70px,_1fr))]",
          "gap-2 max-w-md"
        )}
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current

          if (isColor) {
            const hex = COLOR_MAP[v] ?? "#d1d5db"
            return (
              <button
                key={v}
                onClick={() => updateOption(option.id, v)}
                disabled={disabled}
                title={v}
                data-testid="option-button"
                className={clx(
                  "w-10 h-10 rounded-lg transition-all border-4 border-ui-bg-component",
                  isSelected
                    ? "ring-1 ring-ui-border-interactive"
                    : "hover:ring-1 hover:ring-[#D4D4D8]"
                )}
                style={{ backgroundColor: hex }}
              />
            )
          }

          return (
            <button
              key={v}
              onClick={() => updateOption(option.id, v)}
              disabled={disabled}
              data-testid="option-button"
              className={clx(
                "w-fiull h-10 rounded-lg text-xs transition-all bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover border border-ui-bg-component text-ui-fg-base",
                isSelected
                  ? "ring-1 ring-ui-border-interactive"
                  : "hover:ring-1 hover:ring-ui-border-base"
              )}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect

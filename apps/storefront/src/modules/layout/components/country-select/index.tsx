"use client"

import { updateRegion } from "@lib/data/cart"
import { CursorDefault, Loader } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { DropdownMenu, clx } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { useMemo, useTransition } from "react"
import { useLocale } from "next-intl"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  regions: HttpTypes.StoreRegion[]
  currentCountryCode?: string
  className?: string
}

function getLocalizedCountryName(
  isoCode: string,
  locale: string,
  fallback: string
) {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(
        isoCode.toUpperCase()
      ) ?? fallback
    )
  } catch {
    return fallback
  }
}

const CountrySelect = ({
  regions,
  currentCountryCode,
  className,
}: CountrySelectProps) => {
  const locale = useLocale()
  const currentPath = usePathname()
  const [isPending, startTransition] = useTransition()

  const options = useMemo<CountryOption[]>(() => {
    return regions
      .flatMap((r) =>
        (r.countries ?? []).map((c) => ({
          country: c.iso_2 ?? "",
          region: r.id,
          label: getLocalizedCountryName(
            c.iso_2 ?? "",
            locale,
            c.display_name ?? ""
          ),
        }))
      )
      .filter((o) => o.country)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [regions, locale])

  const selectedCountryOption =
    options.find((o) => o.country === currentCountryCode) ?? options[0]

  const handleRegionChange = (countryCode: string) => {
    const option = options.find((opt) => opt.country === countryCode)
    if (!option) {
      return
    }

    startTransition(() => {
      updateRegion(option.country, currentPath)
    })
  }

  if (!selectedCountryOption) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        className={clx(
          "flex items-center gap-x-1.5 text-ui-fg-subtle hover:text-ui-fg-base transition-colors",
          "min-w-0",
          isPending && "opacity-60 cursor-wait",
          className
        )}
        disabled={isPending}
        data-testid="nav-country-select"
      >
        {isPending ? (
          <Loader className="h-4 w-4 shrink-0 animate-spin text-current transition-colors" />
        ) : (
          <CursorDefault className="shrink-0 text-current transition-colors" />
        )}
        <span className="truncate text-current transition-colors">
          {selectedCountryOption.label}
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        className="z-[60] w-48 max-h-60 overflow-y-auto no-scrollbar"
      >
        <DropdownMenu.RadioGroup
          value={selectedCountryOption.country}
          onValueChange={handleRegionChange}
        >
          {options.map((opt) => (
            <DropdownMenu.RadioItem key={opt.country} value={opt.country}>
              {opt.label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

export default CountrySelect

"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { updateRegion } from "@lib/data/cart"
import { CursorDefault, Loader } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import clsx from "clsx"
import { usePathname } from "next/navigation"
import { Fragment, useMemo, useTransition } from "react"
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

  const handleRegionChange = (option: CountryOption) => {
    startTransition(() => {
      updateRegion(option.country, currentPath)
    })
  }

  if (!selectedCountryOption) {
    return null
  }

  return (
    <Listbox value={selectedCountryOption} onChange={handleRegionChange}>
      <div className={clsx("relative", className)}>
        <ListboxButton
          className={clsx(
            "flex items-center gap-x-1.5 text-ui-fg-subtle hover:text-ui-fg-base transition-colors",
            "min-w-0",
            isPending && "opacity-60 cursor-wait"
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
        </ListboxButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <ListboxOptions className="absolute right-0 top-full z-30 mt-2 w-48 max-h-60 overflow-y-auto rounded-lg bg-ui-bg-base shadow-elevation-card-rest no-scrollbar">
            {options.map((option) => (
              <ListboxOption
                key={option.country}
                value={option}
                className={({
                  active,
                  selected,
                }: {
                  active: boolean
                  selected: boolean
                }) =>
                  clsx(
                    "px-3 py-2 txt-compact-small cursor-pointer",
                    selected
                      ? "text-ui-fg-base bg-ui-bg-component"
                      : active
                        ? "text-ui-fg-base bg-ui-bg-field"
                        : "text-ui-fg-subtle"
                  )
                }
              >
                {option.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  )
}

export default CountrySelect

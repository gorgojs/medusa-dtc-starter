"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import type { StateType } from "@lib/hooks/use-toggle-state"
import { usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import type { HttpTypes } from "@medusajs/types"
import { useLocale, useTranslations } from "next-intl"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
  currentCountryCode?: string
}

const getLocalizedCountryName = (isoCode: string, locale: string, fallback: string): string => {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(isoCode.toUpperCase()) ?? fallback
  } catch {
    return fallback
  }
}

const CountrySelect = ({ toggleState, regions, currentCountryCode }: CountrySelectProps) => {
  const t = useTranslations("CountrySelect")
  const locale = useLocale()
  const [current, setCurrent] = useState<CountryOption | undefined>(undefined)

  const currentPath = usePathname()

  const { state, close } = toggleState

  const options = useMemo(() => {
    return regions
      ?.flatMap((r) => {
        return r.countries?.map((c) => ({
          country: c.iso_2 ?? "",
          region: r.id,
          label: getLocalizedCountryName(c.iso_2 ?? "", locale, c.display_name ?? ""),
        }))
      })
      .filter((o): o is CountryOption => !!o)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [regions, locale])

  useEffect(() => {
    const code = currentCountryCode
    if (code) {
      const option = options?.find((o) => o?.country === code)
      setCurrent(option)
    }
  }, [options, currentCountryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
    close()
  }

  return (
    <div>
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={
          currentCountryCode
            ? options?.find((o) => o?.country === currentCountryCode)
            : undefined
        }
      >
        <ListboxButton className="py-1 w-full">
          <div className="txt-compact-small flex items-start gap-x-2">
            <span>{t("shippingTo")}</span>
            {current && (
              <span className="txt-compact-small flex items-center gap-x-2">
                <ReactCountryFlag
                  svg
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  countryCode={current.country ?? ""}
                />
                {current.label}
              </span>
            )}
          </div>
        </ListboxButton>
        <div className="flex relative w-full min-w-[320px]">
          <Transition
            show={state}
            as={Fragment}
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className="absolute -bottom-[calc(100%-36px)] left-0 xsmall:left-auto xsmall:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-full"
              static
            >
              {options?.map((o, index) => {
                return (
                  <ListboxOption
                    key={index}
                    value={o}
                    className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
                  >
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      countryCode={o?.country ?? ""}
                    />{" "}
                    {o?.label}
                  </ListboxOption>
                )
              })}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default CountrySelect

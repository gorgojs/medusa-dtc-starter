"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { setShippingMethod, updateRegion } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Loader } from "@medusajs/icons"
import MapPin from "@modules/common/icons/map-pin"
import type { HttpTypes } from "@medusajs/types"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import clsx from "clsx"

type CountryOption = {
  country: string
  region: string
  label: string
}

interface CheckoutShippingSectionProps {
  cart: HttpTypes.StoreCart
  availableShippingOptions: HttpTypes.StoreCartShippingOption[] | null
  regions: HttpTypes.StoreRegion[]
  currentCountry: string
}

type ShippingOptionMetadata = {
  delivery_min_days?: unknown
  delivery_max_days?: unknown
}

function parseDeliveryDays(value: unknown) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value)
  }

  return NaN
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

function getDeliveryDaysEstimate(
  shippingOption: HttpTypes.StoreCartShippingOption
) {
  const metadata =
    (shippingOption as unknown as { metadata?: ShippingOptionMetadata })
      .metadata ?? null
  const minDays = parseDeliveryDays(metadata?.delivery_min_days)
  const maxDays = parseDeliveryDays(metadata?.delivery_max_days)

  if (
    !Number.isFinite(minDays) ||
    !Number.isFinite(maxDays) ||
    minDays < 0 ||
    maxDays < minDays
  ) {
    return null
  }

  return {
    minDays,
    maxDays,
  }
}

function getDateFromToday(days: number) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)

  return date
}

function formatDeliveryDateRange(
  minDays: number,
  maxDays: number,
  locale: string
) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  })
  const minDate = getDateFromToday(minDays)
  const maxDate = getDateFromToday(maxDays)

  if (minDate.getTime() === maxDate.getTime()) {
    return dateFormatter.format(minDate)
  }

  return dateFormatter.formatRange(minDate, maxDate).replace(/\s*–\s*/g, "-")
}

export default function CheckoutShippingSection({
  cart,
  availableShippingOptions,
  regions,
  currentCountry,
}: CheckoutShippingSectionProps) {
  const t = useTranslations("CheckoutPage")
  const locale = useLocale()
  const currentPath = usePathname()
  const [isPending, startTransition] = useTransition()

  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const countryOptions = useMemo<CountryOption[]>(() => {
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
    countryOptions.find((o) => o.country === currentCountry) ??
    countryOptions[0]

  const handleRegionChange = (option: CountryOption) => {
    startTransition(() => {
      updateRegion(option.country, currentPath)
    })
  }

  const shippingOptions = availableShippingOptions?.filter(
    (sm) =>
      (
        sm as unknown as {
          service_zone?: { fulfillment_set?: { type?: string } }
        }
      ).service_zone?.fulfillment_set?.type !== "pickup"
  )

  useEffect(() => {
    setIsLoadingPrices(true)
    if (!shippingOptions?.length) {
      setIsLoadingPrices(false)
      return
    }

    const calculatedMethods = shippingOptions.filter(
      (sm) => sm.price_type === "calculated"
    )

    if (!calculatedMethods.length) {
      setIsLoadingPrices(false)
      return
    }

    Promise.allSettled(
      calculatedMethods.map((sm) =>
        calculatePriceForShippingOption(sm.id, cart.id)
      )
    ).then((results) => {
      const pricesMap: Record<string, number> = {}
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value?.id) {
          pricesMap[r.value.id] = r.value.amount ?? 0
        }
      })
      setCalculatedPricesMap(pricesMap)
      setIsLoadingPrices(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableShippingOptions, cart.id])

  const handleSelectShipping = async (id: string) => {
    setShippingError(null)
    const prev = shippingMethodId
    setShippingMethodId(id)
    const err = await setShippingMethod({
      cartId: cart.id,
      shippingMethodId: id,
    }).catch((e: Error) => e.message)
    if (err) {
      setShippingMethodId(prev)
      setShippingError(err as string)
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col-reverse lg:flex-row items-start justify-between gap-x-4">
        <div className="flex flex-col">
          <h2 className="h2-docs">{t("shippingHeading")}</h2>
          <p className="txt-compact-small text-ui-fg-subtle">
            {t("shippingDescription")}
          </p>
        </div>

        <Listbox value={selectedCountryOption} onChange={handleRegionChange}>
          <div className="relative">
            <ListboxButton
              className={clsx(
                "mb-6 flex items-center gap-x-1.5 txt-compact-medium-plus text-ui-fg-subtle hover:text-ui-fg-base transition-colors",
                isPending && "opacity-60 cursor-wait"
              )}
              disabled={isPending}
            >
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <MapPin size={15} />
                  <span>{selectedCountryOption?.label ?? "—"}</span>
                </>
              )}
            </ListboxButton>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <ListboxOptions className="absolute left-0 lg:right-0 lg:left-auto top-full z-30 w-48 max-h-60 overflow-y-auto bg-ui-bg-base rounded-lg shadow-elevation-card-rest no-scrollbar">
                {countryOptions.map((opt) => (
                  <ListboxOption
                    key={opt.country}
                    value={opt}
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
                    {opt.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </Listbox>
      </div>

      <div className="flex gap-x-2 overflow-x-auto no-scrollbar pb-1">
        {shippingOptions && shippingOptions.length > 0 ? (
          shippingOptions.map((shippingOption) => {
            const isSelected = shippingOption.id === shippingMethodId
            const deliveryDaysEstimate = getDeliveryDaysEstimate(shippingOption)
            const deliveryDaysText = deliveryDaysEstimate
              ? deliveryDaysEstimate.maxDays === 0
                ? t("deliveryToday")
                : formatDeliveryDateRange(
                    deliveryDaysEstimate.minDays,
                    deliveryDaysEstimate.maxDays,
                    locale
                  )
              : null

            const shippingPriceAmount =
              shippingOption.price_type === "flat"
                ? shippingOption.amount!
                : calculatedPricesMap[shippingOption.id] !== undefined
                ? calculatedPricesMap[shippingOption.id]
                : null
            const isFreeShipping = shippingPriceAmount === 0
            const price = isFreeShipping
              ? t("freeShipping")
              : shippingPriceAmount !== null
              ? convertToLocale({
                  amount: shippingPriceAmount,
                  currency_code: cart.currency_code,
                  locale,
                })
              : isLoadingPrices
              ? null
              : "—"

            return (
              <button
                key={shippingOption.id}
                type="button"
                onClick={() => handleSelectShipping(shippingOption.id)}
                className={clsx(
                  "flex-shrink-0 w-[180px] p-[10px] rounded-[6px] border text-left transition-colors",
                  isSelected
                    ? "border-ui-border-interactive bg-ui-bg-base"
                    : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-interactive/50"
                )}
                data-testid="delivery-option-radio"
              >
                <div className="flex flex-col gap-y-3">
                  <div className="flex flex-col gap-y-0.5">
                    <span className="txt-compact-medium-plus text-ui-fg-base">
                      {shippingOption.name}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {deliveryDaysText && (
                      <span className="txt-compact-small text-ui-fg-subtle">
                        {deliveryDaysText}
                      </span>
                    )}
                    <div className="flex items-end justify-between">
                      <span
                        className={clsx(
                          "txt-compact-small-plus",
                          isFreeShipping
                            ? "text-[#10B981]"
                            : "text-ui-fg-subtle"
                        )}
                      >
                        {price === null ? (
                          <Loader className="animate-spin w-3 h-3" />
                        ) : (
                          price
                        )}
                      </span>

                      <div
                        className={clsx(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          isSelected
                            ? "border-ui-border-interactive"
                            : "border-ui-border-base"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-ui-fg-interactive" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <p className="txt-compact-small text-ui-fg-muted">
            {t("shippingUnavailable")}
          </p>
        )}
      </div>

      {shippingError && (
        <p className="txt-compact-small text-rose-500">{shippingError}</p>
      )}
    </div>
  )
}

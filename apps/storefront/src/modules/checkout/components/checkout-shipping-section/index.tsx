"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { setShippingMethod, updateCart, updateRegion } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { isPickupShippingOption } from "@lib/util/fulfillment"
import { useCartUpdate } from "@modules/checkout/context/cart-update-context"
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
  availableShippingMethods: HttpTypes.StoreCartShippingOptionWithServiceZone[] | null
  regions: HttpTypes.StoreRegion[]
  currentCountry: string
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

export default function CheckoutShippingSection({
  cart,
  availableShippingMethods,
  regions,
  currentCountry,
}: CheckoutShippingSectionProps) {
  const t = useTranslations("CheckoutPage")
  const locale = useLocale()
  const currentPath = usePathname()
  const [isPending, startTransition] = useTransition()
  const { trackCartUpdate } = useCartUpdate()

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

  const shippingMethods = availableShippingMethods

  useEffect(() => {
    setIsLoadingPrices(true)
    if (!shippingMethods?.length) {
      setIsLoadingPrices(false)
      return
    }

    const calculatedMethods = shippingMethods.filter(
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
  }, [availableShippingMethods, cart.id])

  const handleSelectShipping = async (id: string) => {
    setShippingError(null)
    const prev = shippingMethodId
    setShippingMethodId(id)
    const err = await trackCartUpdate(() =>
      setShippingMethod({
        cartId: cart.id,
        shippingMethodId: id,
      })
    ).catch((e: Error) => e.message)
    if (err) {
      setShippingMethodId(prev)
      setShippingError(err as string)
      return
    }

    const selectedOption = shippingMethods?.find((option) => option.id === id)
    const addr = cart.shipping_address
    const hasDeliveryFields = !!(
      addr?.address_1 ||
      addr?.address_2 ||
      addr?.city ||
      addr?.postal_code ||
      addr?.province ||
      addr?.company
    )

    if (isPickupShippingOption(selectedOption) && hasDeliveryFields) {
      await trackCartUpdate(() =>
        updateCart({
          shipping_address: {
            first_name: addr?.first_name || "",
            last_name: addr?.last_name || "",
            phone: addr?.phone || "",
            country_code: addr?.country_code || "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            postal_code: "",
            province: "",
          },
        } as HttpTypes.StoreUpdateCart)
      ).catch((e: Error) => setShippingError(e.message))
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

      {/* Shipping method cards */}
      <div className="flex gap-x-2 overflow-x-auto no-scrollbar pb-1">
        {shippingMethods && shippingMethods.length > 0 ? (
          shippingMethods.map((option) => {
            const isSelected = option.id === shippingMethodId

            const price =
              option.price_type === "flat"
                ? convertToLocale({
                    amount: option.amount!,
                    currency_code: cart.currency_code,
                    locale,
                  })
                : calculatedPricesMap[option.id] !== undefined
                ? convertToLocale({
                    amount: calculatedPricesMap[option.id],
                    currency_code: cart.currency_code,
                    locale,
                  })
                : isLoadingPrices
                ? null
                : "—"

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectShipping(option.id)}
                className={clsx(
                  "flex-shrink-0 w-[180px] p-[10px] rounded-[6px] border text-left transition-colors",
                  isSelected
                    ? "border-ui-border-interactive bg-ui-bg-base"
                    : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-interactive/50"
                )}
                data-testid="delivery-option-radio"
              >
                <div className="flex flex-col gap-y-3">
                  <span className="txt-compact-medium-plus text-ui-fg-base">
                    {option.name}
                  </span>
                  <div className="flex items-end justify-between">
                    <span className="txt-compact-small-plus text-ui-fg-subtle">
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

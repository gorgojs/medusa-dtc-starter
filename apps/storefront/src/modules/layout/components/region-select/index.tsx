"use client"

import { updateRegion } from "@lib/data/cart"
import { updateLocale } from "@lib/data/locale-actions"
import type { Locale } from "@i18n/config"
import { ChevronDown, XMark } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  RadioGroup,
  Tabs,
  clx,
} from "@medusajs/ui"
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import ReactCountryFlag from "react-country-flag"

type CountryOption = {
  country: string
  region: string
  label: string
  currencyCode: string
}

type LanguageOption = {
  code: string
  label: string
  description: string
}

type RegionSelectProps = {
  regions: HttpTypes.StoreRegion[]
  currentCountryCode?: string
  locales: Locale[]
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

function getLocalizedLanguageName(
  code: string,
  fallback: string,
  displayLocale: string
) {
  try {
    return (
      new Intl.DisplayNames([displayLocale], { type: "language" }).of(code) ??
      fallback
    )
  } catch {
    return fallback
  }
}

type RegionOptionRowProps = {
  id: string
  value: string
  label: string
  description: string
}

const RegionOptionRow = ({ id, value, label, description }: RegionOptionRowProps) => {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-x-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-ui-bg-base-hover transition-colors"
    >
      <RadioGroup.Item value={value} id={id} />
      <span className="flex flex-col">
        <span className="txt-compact-small text-ui-fg-base">{label}</span>
        <span className="txt-compact-xsmall text-ui-fg-subtle">{description}</span>
      </span>
    </label>
  )
}

const RegionSelect = ({
  regions,
  currentCountryCode,
  locales,
  className,
}: RegionSelectProps) => {
  const t = useTranslations("RegionSelect")
  const tLang = useTranslations("LanguageSelect")
  const currentLocale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"country" | "language">("country")
  const [pendingCountry, setPendingCountry] = useState(currentCountryCode)
  const [pendingLocale, setPendingLocale] = useState(currentLocale)

  const countryOptions = useMemo<CountryOption[]>(() => {
    return regions
      .flatMap((r) =>
        (r.countries ?? []).map((c) => ({
          country: c.iso_2 ?? "",
          region: r.id,
          label: getLocalizedCountryName(
            c.iso_2 ?? "",
            currentLocale,
            c.display_name ?? ""
          ),
          currencyCode: r.currency_code?.toUpperCase() ?? "",
        }))
      )
      .filter((o) => o.country)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [regions, currentLocale])

  const languageOptions = useMemo<LanguageOption[]>(() => {
    return locales.map((l) => {
      const nativeLabel = tLang(`locales.${l.code}`, { fallback: l.name })
      return {
        code: l.code,
        label: nativeLabel,
        description: getLocalizedLanguageName(l.code, nativeLabel, currentLocale),
      }
    })
  }, [locales, currentLocale, tLang])

  const selectedCountryOption =
    countryOptions.find((o) => o.country === currentCountryCode) ??
    countryOptions[0]

  useEffect(() => {
    if (!open) return
    setPendingCountry(selectedCountryOption?.country)
    setPendingLocale(currentLocale)
    setTab("country")
  }, [open, selectedCountryOption?.country, currentLocale])

  if (!selectedCountryOption) {
    return null
  }

  const triggerFlagCode = selectedCountryOption.country.toUpperCase()

  function handleApply() {
    const countryChanged =
      !!pendingCountry && pendingCountry !== selectedCountryOption?.country
    const localeChanged = pendingLocale !== currentLocale

    if (!countryChanged && !localeChanged) {
      setOpen(false)
      return
    }

    const segments = pathname.split("/").filter(Boolean)
    if (localeChanged) {
      segments[0] = pendingLocale
    }
    const newPath = "/" + segments.join("/")

    startTransition(async () => {
      if (localeChanged) {
        await updateLocale(pendingLocale)
      }
      if (countryChanged && pendingCountry) {
        await updateRegion(pendingCountry, newPath)
        return
      }
      setOpen(false)
      if (localeChanged) {
        router.push(newPath)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="nav-region-select-button"
        className={clx(
          "flex items-center gap-x-1.5 text-ui-fg-subtle hover:text-ui-fg-base transition-colors",
          className
        )}
      >
        <ReactCountryFlag
          svg
          countryCode={triggerFlagCode}
          style={{ width: "16px", height: "16px" }}
          className="shrink-0 rounded-sm"
        />
        <span className="uppercase">{currentLocale}</span>
        <ChevronDown className="shrink-0 w-2.5 h-2.5" />
      </button>

      <Transition show={open}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex justify-end">
            <TransitionChild
              enter="ease-out duration-250"
              enterFrom="opacity-0 translate-x-8"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-8"
            >
              <DialogPanel className="flex flex-col h-[calc(100%-16px)] w-[calc(100%-16px)] sm:w-1/3 2xl:w-1/4 sm:min-w-[360px] m-2 rounded-rounded bg-ui-bg-base p-6 gap-6">
                <div className="flex items-center justify-between shrink-0">
                  <DialogTitle className="txt-xlarge text-ui-fg-base">
                    {t("title")}
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t("close")}
                    data-testid="close-region-select-button"
                    className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors p-0.5"
                  >
                    <XMark />
                  </button>
                </div>

                <Tabs
                  value={tab}
                  onValueChange={(value) => setTab(value as "country" | "language")}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <Tabs.List className="shrink-0">
                    <Tabs.Trigger value="country">{t("tabCountry")}</Tabs.Trigger>
                    <Tabs.Trigger value="language">{t("tabLanguage")}</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content
                    value="country"
                    className="flex-1 overflow-y-auto no-scrollbar mt-4"
                  >
                    <RadioGroup
                      value={pendingCountry}
                      onValueChange={setPendingCountry}
                      disabled={isPending}
                      className="gap-1"
                    >
                      {countryOptions.map((opt) => (
                        <RegionOptionRow
                          key={opt.country}
                          id={`region-country-${opt.country}`}
                          value={opt.country}
                          label={opt.label}
                          description={opt.currencyCode}
                        />
                      ))}
                    </RadioGroup>
                  </Tabs.Content>
                  <Tabs.Content
                    value="language"
                    className="flex-1 overflow-y-auto no-scrollbar mt-4"
                  >
                    <RadioGroup
                      value={pendingLocale}
                      onValueChange={setPendingLocale}
                      disabled={isPending}
                      className="gap-1"
                    >
                      {languageOptions.map((opt) => (
                        <RegionOptionRow
                          key={opt.code}
                          id={`region-language-${opt.code}`}
                          value={opt.code}
                          label={opt.label}
                          description={opt.description}
                        />
                      ))}
                    </RadioGroup>
                  </Tabs.Content>
                </Tabs>

                <Button
                  type="button"
                  size="large"
                  className="w-full shrink-0"
                  disabled={isPending}
                  isLoading={isPending}
                  onClick={handleApply}
                >
                  {t("apply")}
                </Button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default RegionSelect

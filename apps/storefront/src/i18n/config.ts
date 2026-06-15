export const locales = ["ru", "en"] as const

export const defaultLocale = "ru" as const satisfies AppLocale

export type AppLocale = (typeof locales)[number]

export type Locale = {
  code: string
  name: string
}

export const localeLabels: Record<AppLocale, string> = {
  ru: "Русский",
  en: "English",
}

export const appLocales: Locale[] = locales.map((code) => ({
  code,
  name: localeLabels[code],
}))

export function isAppLocale(
  value: string | null | undefined
): value is AppLocale {
  return !!value && locales.includes(value as AppLocale)
}

export const countryLocaleMap: Partial<Record<string, AppLocale>> = {
  ru: "ru",
  kz: "ru",
  by: "ru",
  uz: "ru",
  kg: "ru",
  tj: "ru",
  am: "ru",
  az: "ru",
  ge: "ru",
  ua: "ru",
  md: "ru",
  us: "en",
  gb: "en",
  au: "en",
  ca: "en",
  nz: "en",
}

export function getDefaultLocaleForCountry(countryCode: string): AppLocale {
  return countryLocaleMap[countryCode.toLowerCase()] ?? defaultLocale
}

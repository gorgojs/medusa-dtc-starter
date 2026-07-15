export const locales = ["ru", "en", "fr", "es"] as const

export const defaultLocale = "ru" as const satisfies AppLocale

export type AppLocale = (typeof locales)[number]

export type Locale = {
  code: string
  name: string
}

export const localeLabels: Record<AppLocale, string> = {
  ru: "Русский",
  en: "English",
  fr: "Français",
  es: "Español",
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
  fr: "fr",
  be: "fr",
  ch: "fr",
  es: "es",
  mx: "es",
  ar: "es",
  co: "es",
  cl: "es",
  pe: "es",
}

export function getDefaultLocaleForCountry(countryCode: string): AppLocale {
  return countryLocaleMap[countryCode.toLowerCase()] ?? defaultLocale
}

export function matchBrowserLocale(
  acceptLanguage: string | null | undefined
): AppLocale | undefined {
  if (!acceptLanguage) return undefined

  const primary = acceptLanguage
    .split(",")[0]
    .trim()
    .split(";")[0]
    .split("-")[0]
    .toLowerCase()

  return isAppLocale(primary) ? primary : undefined
}

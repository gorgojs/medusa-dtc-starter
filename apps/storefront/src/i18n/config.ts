export const locales = ["en", "es", "fr", "ru"] as const

export const defaultLocale = "en" as const satisfies AppLocale

export type AppLocale = (typeof locales)[number]

export type Locale = {
  code: string
  name: string
}

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  ru: "Русский",
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

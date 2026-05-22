export const locales = ["ru", "en"] as const

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

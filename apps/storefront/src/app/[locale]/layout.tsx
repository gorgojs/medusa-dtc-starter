import { NextIntlClientProvider } from "next-intl"
import { locales } from "@i18n/config"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}

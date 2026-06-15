import { NextIntlClientProvider } from "next-intl"
import { locales } from "@i18n/config"

export function generateStaticParams() {
  return locales.map((language) => ({ language }))
}

export default async function LanguageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}

import { NextIntlClientProvider } from "next-intl"

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}

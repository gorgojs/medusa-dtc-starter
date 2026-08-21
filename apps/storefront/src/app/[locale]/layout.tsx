import { NextIntlClientProvider } from "next-intl"
import HtmlDirSync from "@modules/common/components/html-dir-sync"

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextIntlClientProvider>
      <HtmlDirSync />
      {children}
    </NextIntlClientProvider>
  )
}

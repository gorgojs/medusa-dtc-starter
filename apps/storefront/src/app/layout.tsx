import { getBaseURL } from "@lib/util/env"
import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} data-mode="light">
      <NextIntlClientProvider>
        <body>
          <main className="relative">{props.children}</main>
        </body>
      </NextIntlClientProvider>
    </html>
  )
}

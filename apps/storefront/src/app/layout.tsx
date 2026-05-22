import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <NextIntlClientProvider>
        <body>
          <main className="relative">{props.children}</main>
        </body>
      </NextIntlClientProvider>
    </html>
  )
}

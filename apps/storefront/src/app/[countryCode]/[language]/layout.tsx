import { locales } from "@i18n/config"

export function generateStaticParams() {
  return locales.map((language) => ({ language }))
}

export default function LanguageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

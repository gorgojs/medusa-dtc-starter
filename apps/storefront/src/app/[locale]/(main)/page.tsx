import type { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { buildAlternates } from "@lib/util/alternates"
import { getCountryCode } from "@lib/data/cookies"
import { getTranslations, getLocale } from "next-intl/server"
import { defaultLocale } from "@i18n/config"

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations("Metadata.home"),
    getLocale(),
  ])
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/"),
  }
}

export default async function Home() {
  const [countryCode, locale, { collections }] = await Promise.all([
    getCountryCode(),
    getLocale(),
    listCollections({ fields: "id, handle, title" }),
  ])

  const region = await getRegion(countryCode ?? defaultLocale)

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}

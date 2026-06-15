import type { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { buildAlternates } from "@lib/util/alternates"
import { getTranslations, getLocale } from "next-intl/server"

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode } = await params
  const [t, locale] = await Promise.all([
    getTranslations("Metadata.home"),
    getLocale(),
  ])
  return {
    title: t("title"),
    description: t("description"),
    alternates: await buildAlternates(countryCode, locale, "/"),
  }
}

export default async function Home(props: Props) {
  const params = await props.params

  const { countryCode } = params

  const [region, { collections }] = await Promise.all([
    getRegion(countryCode),
    listCollections({ fields: "id, handle, title" }),
  ])

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

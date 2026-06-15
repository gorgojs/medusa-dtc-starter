import { locales } from "@i18n/config"
import { getBaseURL } from "@lib/util/env"
import { listRegions } from "@lib/data/regions"

const BASE = getBaseURL().replace(/\/$/, "")

export async function buildAlternates(countryCode: string, locale: string, path: string) {
  const regions = await listRegions()
  const allCountryCodes = regions
    .flatMap((r) => r.countries?.map((c) => c.iso_2) ?? [])
    .filter(Boolean) as string[]

  const normalizedPath = path === "/" ? "" : path
  const suffix = normalizedPath || "/"

  const languages: Record<string, string> = {
    "x-default": `${BASE}/`,
  }

  for (const cc of allCountryCodes) {
    for (const l of locales) {
      languages[`${l}-${cc.toUpperCase()}`] = `${BASE}/${cc}/${l}${suffix}`
    }
  }

  return {
    canonical: `${BASE}/${countryCode}/${locale}${suffix}`,
    languages,
  }
}

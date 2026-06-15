import { isAppLocale, defaultLocale, getDefaultLocaleForCountry } from "@i18n/config"
import type { HttpTypes } from "@medusajs/types"
import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"
const LOCALE_COOKIE = "_medusa_locale"

const INTL_LOCALE_HEADER = "X-NEXT-INTL-LOCALE"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const { regions } = await response.json()

    if (!regions?.length) {
      return new Map<string, HttpTypes.StoreRegion>()
    }

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCodeFromGeo(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>
): Promise<string | undefined> {
  const cloudflare = (request as { cf?: { country?: string } }).cf?.country?.toLowerCase()
  const vercel = request.headers.get("x-vercel-ip-country")?.toLowerCase()

  if (cloudflare && regionMap.has(cloudflare)) return cloudflare
  if (vercel && regionMap.has(vercel)) return vercel
  if (regionMap.has(DEFAULT_REGION)) return DEFAULT_REGION
  return regionMap.keys().next().value
}


export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()
  const regionMap = await getRegionMap(cacheId)

  const segments = request.nextUrl.pathname.split("/").filter(Boolean)
  const firstIsCountry = segments[0] && regionMap.has(segments[0].toLowerCase())
  const countryCode = firstIsCountry
    ? segments[0].toLowerCase()
    : await getCountryCodeFromGeo(request, regionMap) ?? DEFAULT_REGION

  const localeIndex = firstIsCountry && segments[1] && isAppLocale(segments[1]) ? 1 : -1
  const hasLocaleInUrl = localeIndex >= 0

  function withCacheId(res: NextResponse): NextResponse {
    if (!cacheIdCookie) {
      res.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    }
    return res
  }

  if (hasLocaleInUrl) {
    const locale = segments[localeIndex]
    const res = NextResponse.next()
    res.headers.set(INTL_LOCALE_HEADER, locale)
    return withCacheId(res)
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const locale =
    cookieLocale && isAppLocale(cookieLocale)
      ? cookieLocale
      : getDefaultLocaleForCountry(countryCode)

  if (firstIsCountry) {
    const pathAfterCountry = segments.slice(1).join("/")
    const redirectPath = pathAfterCountry
      ? `/${countryCode}/${locale}/${pathAfterCountry}`
      : `/${countryCode}/${locale}`
    const redirectUrl = new URL(redirectPath, request.url)
    redirectUrl.search = request.nextUrl.search
    return withCacheId(NextResponse.redirect(redirectUrl, 307))
  }

  const trailingPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const redirectUrl = `${request.nextUrl.origin}/${countryCode}/${locale}${trailingPath}${request.nextUrl.search}`
  return withCacheId(NextResponse.redirect(redirectUrl, 307))
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}

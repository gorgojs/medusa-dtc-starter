import { isAppLocale, defaultLocale, matchBrowserLocale } from "@i18n/config"
import { DEFAULT_REGION } from "@lib/util/env"
import type { HttpTypes } from "@medusajs/types"
import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const LOCALE_COOKIE = "_medusa_locale"
const COUNTRY_COOKIE = "_medusa_country"

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
): Promise<string> {
  const cloudflare = (request as { cf?: { country?: string } }).cf?.country?.toLowerCase()
  const vercel = request.headers.get("x-vercel-ip-country")?.toLowerCase()

  if (cloudflare && regionMap.has(cloudflare)) return cloudflare
  if (vercel && regionMap.has(vercel)) return vercel
  if (regionMap.has(DEFAULT_REGION)) return DEFAULT_REGION
  return regionMap.keys().next().value ?? DEFAULT_REGION
}


export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()
  const regionMap = await getRegionMap(cacheId)

  const segments = request.nextUrl.pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]
  const hasLocaleInUrl = firstSegment && isAppLocale(firstSegment)

  const persistentCookieOpts = {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  }

  function withCookies(res: NextResponse, countryCode: string, locale: string): NextResponse {
    if (!cacheIdCookie) {
      res.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    }
    res.cookies.set(COUNTRY_COOKIE, countryCode, persistentCookieOpts)
    res.cookies.set(LOCALE_COOKIE, locale, persistentCookieOpts)
    return res
  }

  if (hasLocaleInUrl) {
    const locale = firstSegment
    const existingCountry = request.cookies.get(COUNTRY_COOKIE)?.value
    const countryCode = existingCountry && regionMap.has(existingCountry)
      ? existingCountry
      : await getCountryCodeFromGeo(request, regionMap)

    const res = NextResponse.next()
    res.headers.set(INTL_LOCALE_HEADER, locale)
    return withCookies(res, countryCode, locale)
  }

  // No locale in URL — detect and redirect 302
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const cookieCountry = request.cookies.get(COUNTRY_COOKIE)?.value
  const countryCode = cookieCountry && regionMap.has(cookieCountry)
    ? cookieCountry
    : await getCountryCodeFromGeo(request, regionMap)

  const locale =
    cookieLocale && isAppLocale(cookieLocale)
      ? cookieLocale
      : (matchBrowserLocale(request.headers.get("accept-language")) ??
        defaultLocale)

  const trailingPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const redirectUrl = new URL(`/${locale}${trailingPath}${request.nextUrl.search}`, request.url)
  const res = NextResponse.redirect(redirectUrl, 302)
  return withCookies(res, countryCode, locale)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}

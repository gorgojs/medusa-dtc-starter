import { getTranslations } from "next-intl/server"
import { Link } from "@i18n/navigation"

import { appLocales } from "@i18n/config"
import { listRegions } from "@lib/data/regions"
import { getCountryCode } from "@lib/data/cookies"
import type { StoreRegion } from "@medusajs/types"
import { MagnifyingGlass, User } from "@medusajs/icons"
import CartButton from "@modules/layout/components/cart-button"
import CountrySelect from "@modules/layout/components/country-select"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const t = await getTranslations()
  const [regions, countryCode] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    getCountryCode(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-[64px] border-b mx-auto duration-200 bg-white">
        <nav className="content-container txt-compact-xsmall text-ui-fg-subtle flex items-center gap-x-4 md:justify-between w-full h-full">
          <div className="flex flex-1 items-center h-full">
            <SideMenu locales={appLocales} />
          </div>

          <Link
            href="/"
            className="shrink-0 txt-compact-medium font-semibold text-ui-fg-subtle uppercase hover:text-ui-fg-base transition-colors"
            data-testid="nav-store-link"
          >
            {t("Common.storeName")}
          </Link>

          <div className="ml-auto flex h-full flex-1 items-center justify-end gap-x-4 md:ml-0">
            <button
              type="button"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlass />
            </button>
            <div className="hidden min-w-0 max-w-[160px] md:flex">
              <CountrySelect
                regions={regions}
                currentCountryCode={countryCode ?? undefined}
                className="min-w-0"
              />
            </div>
            <Link
              className="hidden md:block hover:text-ui-fg-base"
              href="/account"
              data-testid="nav-account-link"
            >
              <User />
            </Link>
            <div className="hidden h-full items-center md:flex">
              <CartButton />
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}

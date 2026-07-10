import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { Link } from "@i18n/navigation"

import { appLocales } from "@i18n/config"
import { listRegions } from "@lib/data/regions"
import { getCountryCode } from "@lib/data/cookies"
import type { StoreRegion } from "@medusajs/types"
import { MagnifyingGlass } from "@medusajs/icons"
import CartButton from "@modules/layout/components/cart-button"
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
          <div className="flex items-center h-full md:w-[200px]">
            <SideMenu
              regions={regions}
              locales={appLocales}
              currentCountryCode={countryCode ?? undefined}
            />
          </div>

          <Link
            href="/"
            className="txt-compact-medium font-semibold text-ui-fg-subtle uppercase hover:text-ui-fg-base transition-colors"
            data-testid="nav-store-link"
          >
            {t("Common.storeName")}
          </Link>

          <div className="flex justify-end items-center gap-x-4 h-full md:w-[200px] ml-auto md:ml-0">
            <button
              type="button"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlass />
            </button>
            <Link
              className="hover:text-ui-fg-base hidden md:block"
              href="/account"
              data-testid="nav-account-link"
            >
              {t("Nav.account")}
            </Link>
            <div className="hidden md:flex">
              <Suspense
                fallback={
                  <Link
                    className="hover:text-ui-fg-base gap-2"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    {t("Nav.cart", { count: 0 })}
                  </Link>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}

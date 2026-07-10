import { retrieveCustomer } from "@lib/data/customer"
import { ArrowLeft, UserMini } from "@medusajs/icons"
import { Link } from "@i18n/navigation"
import { getTranslations } from "next-intl/server"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [customer, t, tCommon] = await Promise.all([
    retrieveCustomer(),
    getTranslations("CheckoutPage"),
    getTranslations("Common"),
  ])

  return (
    <div className="min-h-screen bg-ui-bg-base flex flex-col">
      <header className="border-b border-ui-border-base bg-ui-bg-base sticky top-0 z-40">
        <div className="flex items-center content-container py-3 h-16">
          <div className="flex flex-1 items-center">
            <Link
              href="/cart"
              className="flex items-center gap-x-2 txt-compact-medium-plus text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
              data-testid="back-to-cart-link"
            >
              <ArrowLeft />
              <span className="hidden sm:inline">{t("backToCart")}</span>
              <span className="sm:hidden font-semibold uppercase">
                {tCommon("storeName")}
              </span>
            </Link>
          </div>

          <Link
            href="/"
            className="hidden sm:block shrink-0 txt-compact-medium font-semibold text-ui-fg-subtle uppercase hover:text-ui-fg-base transition-colors"
            data-testid="store-link"
          >
            {tCommon("storeName")}
          </Link>

          <div className="flex flex-1 items-center justify-end">
            {customer ? (
              <div className="flex items-center gap-x-1 txt-compact-medium text-ui-fg-subtle">
                <UserMini />
                <span className="text-xs truncate hidden md:block">
                  {customer.email}
                </span>
              </div>
            ) : (
              <Link
                href="/account"
                className="txt-compact-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1" data-testid="checkout-container">
        {children}
      </main>

      <footer className="border-t border-ui-border-base bg-ui-bg-base">
        <div className="flex flex-col sm:flex-row items-center justify-between content-container gap-2 h-16">
          <span className="txt-compact-medium font-semibold text-ui-fg-subtle uppercase">
            {tCommon("storeName")}
          </span>
        </div>
      </footer>
    </div>
  )
}

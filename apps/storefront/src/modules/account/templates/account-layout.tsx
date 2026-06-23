import type React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import type { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout = async ({ customer, children }: AccountLayoutProps) => {
  const t = await getTranslations("AccountLayout")

  return (
    <div className="flex-1" data-testid="account-page">
      <div className="flex-1 h-full flex flex-col">
        <div className="content-container grid grid-cols-1 small:grid-cols-[240px_1fr] py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="h-px bg-ui-border-base" />
        <div className="flex flex-col small:flex-row items-end justify-between py-12 gap-8 content-container">
          <div>
            <h3 className="text-xl-semi mb-4">{t("gotQuestions")}</h3>
            <span className="txt-medium">{t("faqDescription")}</span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              {t("customerService")}
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout

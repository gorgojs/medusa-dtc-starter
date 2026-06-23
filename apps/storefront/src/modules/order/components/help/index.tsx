import { Heading } from "@modules/common/components/ui"
import { Link } from "@i18n/navigation"
import React from "react"
import { getTranslations } from "next-intl/server"

const Help = async () => {
  const t = await getTranslations("Help")

  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{t("needHelp")}</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <Link href="/contact">{t("contact")}</Link>
          </li>
          <li>
            <Link href="/contact">
              {t("returnsExchanges")}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help

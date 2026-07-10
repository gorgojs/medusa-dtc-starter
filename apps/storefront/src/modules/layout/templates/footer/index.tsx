import { Link } from "@i18n/navigation"
import { getTranslations } from "next-intl/server"
import { listCategories } from "@lib/data/categories"

import Medusa from "@modules/common/icons/medusa"
import NextJs from "@modules/common/icons/nextjs"

export default async function Footer() {
  const t = await getTranslations("Footer")
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-ui-border-base w-full bg-white">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 md:flex-row md:items-start md:justify-between py-20">
          <div>
            <Link
              href="/"
              className="txt-compact-medium-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase transition-colors"
            >
              {t("storeName")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-10 md:gap-x-16">
            <div className="flex flex-col gap-y-3">
              <span className="txt-medium-plus text-ui-fg-base font-medium">
                {t("categoriesHeading")}
              </span>
              <ul className="flex flex-col gap-y-2">
                {productCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.handle}`}
                      className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-3">
              <span className="txt-medium-plus text-ui-fg-base font-medium">
                {t("infoHeading")}
              </span>
              <ul className="flex flex-col gap-y-2">
                <li>
                  <a
                    href="https://gorgojs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                  >
                    Gorgo
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/gorgojs/medusa-dtc-starter"
                    target="_blank"
                    rel="noreferrer"
                    className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                  >
                    {t("sourceCode")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.medusajs.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                  >
                    {t("medusaDocs")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ui-border-base w-full">
        <div className="content-container flex w-full mb-6 justify-between items-center pt-4 text-ui-fg-muted">
          <span className="txt-medium">
            {t("copyright", { year: new Date().getFullYear() })}
          </span>
          <span className="hidden lg:flex gap-x-2 txt-compact-small-plus items-center">
            {t("poweredBy")}
            <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
              <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
            </a>
            &
            <a href="https://nextjs.org" target="_blank" rel="noreferrer">
              <NextJs fill="#9ca3af" />
            </a>
          </span>
          <div className="flex lg:hidden gap-x-4 txt-compact-small">
            <a href="#" className="hover:text-ui-fg-subtle transition-colors">
              {t("publicOffer")}
            </a>
            <a href="#" className="hover:text-ui-fg-subtle transition-colors">
              {t("privacyPolicy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

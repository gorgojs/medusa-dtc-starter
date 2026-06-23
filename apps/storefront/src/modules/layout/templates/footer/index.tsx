import { Link } from "@i18n/navigation"
import { getTranslations } from "next-intl/server"

import Medusa from "@modules/common/icons/medusa"
import NextJs from "@modules/common/icons/nextjs"
import VK from "@modules/common/icons/vk"
import Telegram from "@modules/common/icons/telegram"

export default async function Footer() {
  const t = await getTranslations("Footer")

  return (
    <footer className="border-t border-ui-border-base w-full bg-white">
      <div className="content-container flex flex-col w-full">
        {/* Main footer content */}
        <div className="flex flex-row items-start justify-between py-10 gap-x-8">
          {/* Logo */}
          <div className="w-[232px] shrink-0">
            <Link
              href="/"
              className="txt-compact-medium-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase transition-colors"
            >
              {t("storeName")}
            </Link>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-y-3 w-[232px] shrink-0">
            <span className="txt-medium-plus text-ui-fg-base font-medium">
              {t("categoriesHeading")}
            </span>
            <ul className="flex flex-col gap-y-2">
              <li>
                <Link
                  href="/"
                  className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                >
                  {t("navHome")}
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                >
                  {t("navStore")}
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="txt-compact-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                >
                  {t("navBrand")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-y-3 w-[232px] shrink-0">
            <span className="txt-medium-plus text-ui-fg-base font-medium">
              {t("contactHeading")}
            </span>
            <ul className="flex flex-col gap-y-2">
              <li className="flex items-center gap-x-1">
                <span className="txt-compact-medium text-ui-fg-subtle">{t("addressLabel")}</span>
                <span className="txt-compact-medium text-ui-fg-base">{t("address")}</span>
              </li>
              <li className="flex items-center gap-x-1">
                <span className="txt-compact-medium text-ui-fg-subtle">{t("emailLabel")}</span>
                <a
                  href={`mailto:${t("email")}`}
                  className="txt-compact-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
                >
                  {t("email")}
                </a>
              </li>
              <li className="flex items-center gap-x-1">
                <span className="txt-compact-medium text-ui-fg-subtle">{t("phoneLabel")}</span>
                <a
                  href={`tel:${t("phone")}`}
                  className="txt-compact-medium text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
                >
                  {t("phone")}
                </a>
              </li>
            </ul>
          </div>

          {/* Social icons */}
          <div className="flex items-center justify-end gap-x-4 w-[232px] shrink-0 pt-1">
            <a
              href="https://vk.com"
              target="_blank"
              rel="noreferrer"
              aria-label="VK"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            >
              <VK size={24} />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            >
              <Telegram size={24} />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex w-full mb-6 justify-between items-center border-t border-ui-border-base pt-4 text-ui-fg-muted">
          <span className="txt-medium">
            {t("copyright", { year: new Date().getFullYear() })}
          </span>
          <span className="flex gap-x-2 txt-compact-small-plus items-center">
            {t("poweredBy")}
            <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
              <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
            </a>
            &
            <a href="https://nextjs.org" target="_blank" rel="noreferrer">
              <NextJs fill="#9ca3af" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

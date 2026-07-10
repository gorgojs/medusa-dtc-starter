"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import type { Locale } from "@i18n/config"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, BarsThree, XMark } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Link } from "@i18n/navigation"
import { clx, Text } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"

const sideMenuItems = [
  { key: "home" as const, href: "/" },
  { key: "store" as const, href: "/store" },
  { key: "account" as const, href: "/account" },
  { key: "cart" as const, href: "/cart" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentCountryCode?: string
}

const SideMenu = ({ regions, locales, currentCountryCode }: SideMenuProps) => {
  const t = useTranslations()
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex gap-1 items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base txt-compact-xsmall"
                >
                  <BarsThree />
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-[51] inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {sideMenuItems.map(({ key, href }) => (
                        <li key={key}>
                          <Link
                            href={href}
                            className="text-3xl leading-10 hover:text-ui-fg-disabled"
                            onClick={close}
                            data-testid={`${key}-link`}
                          >
                            {t(`SideMenu.items.${key}`)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                            currentCountryCode={currentCountryCode}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <Text className="flex justify-between txt-compact-small">
                        {t("SideMenu.copyright", {
                          year: new Date().getFullYear(),
                        })}
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu

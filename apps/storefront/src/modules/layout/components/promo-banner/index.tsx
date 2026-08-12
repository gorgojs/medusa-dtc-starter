"use client"

import {
  ExclamationCircleSolid,
  XMark,
} from "@medusajs/icons"
import { useTranslations } from "next-intl"
import { useState } from "react"

const PROMO_BANNER_COOKIE = "_promo_banner_dismissed"

function PromoBanner(props: { dismissed: boolean }) {
  const t = useTranslations("PromoBanner")
  const [isVisible, setIsVisible] = useState(!props.dismissed)

  if (!isVisible) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
    document.cookie = `${PROMO_BANNER_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  return (
    <div className="sticky top-16 inset-x-0 z-40 text-neutral-50 bg-neutral-900 text-sm">
      <div className="content-container relative flex items-center justify-center small:py-4 py-2 text-center">
        <div className="flex flex-col small:flex-row justify-center small:gap-2 gap-1 items-center">
          <span className="flex items-center gap-1">
            <ExclamationCircleSolid className="inline" color="#A1A1AA" />
            {t("message")}
          </span>

          <a
            href="https://gorgojs.com"
            target="_blank"
            rel="noreferrer"
            className="bg-[linear-gradient(163deg,#deba92_19.34%,#9f724e_47.13%,#7a482e_81.21%)] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            {t("cta")} →
          </a>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label={t("close")}
          className="absolute right-6 text-neutral-400 hover:text-neutral-50 transition-colors"
        >
          <XMark />
        </button>
      </div>
    </div>
  )
}

export default PromoBanner

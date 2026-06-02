"use client"

import { useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const t = useTranslations("ProductTabs")
  const [shippingOpen, setShippingOpen] = useState(false)

  return (
    <div className="w-full flex flex-col">
      {product.description && (
        <div className="py-3 border-b border-[#E4E4E7]">
          <div className="flex flex-col gap-y-4">
            {product.description
              .split(/\n\n+/)
              .filter(Boolean)
              .map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-[160%] text-[#52525B] whitespace-pre-line"
                >
                  {para}
                </p>
              ))}
          </div>
        </div>
      )}

      <div className="border-b border-[#E4E4E7]">
        <button
          className="flex items-center justify-between w-full py-3 text-base leading-[160%] text-[#71717A] text-left"
          onClick={() => setShippingOpen((o) => !o)}
        >
          <span>{t("shippingReturns")}</span>
          <span className="text-[#18181B] text-xl leading-none select-none">
            {shippingOpen ? "−" : "+"}
          </span>
        </button>
        {shippingOpen && (
          <div className="pb-4">
            <ShippingInfoTab />
          </div>
        )}
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  const t = useTranslations("ProductTabs")

  return (
    <div className="flex flex-col gap-y-6 text-sm">
      <div className="flex items-start gap-x-2">
        <FastDelivery />
        <div className="flex flex-col gap-y-1">
          <span className="font-medium text-[#18181B]">{t("fastDelivery")}</span>
          <p className="text-[#52525B]">{t("fastDeliveryDesc")}</p>
        </div>
      </div>
      <div className="flex items-start gap-x-2">
        <Refresh />
        <div className="flex flex-col gap-y-1">
          <span className="font-medium text-[#18181B]">{t("simpleExchanges")}</span>
          <p className="text-[#52525B]">{t("simpleExchangesDesc")}</p>
        </div>
      </div>
      <div className="flex items-start gap-x-2">
        <Back />
        <div className="flex flex-col gap-y-1">
          <span className="font-medium text-[#18181B]">{t("easyReturns")}</span>
          <p className="text-[#52525B]">{t("easyReturnsDesc")}</p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs

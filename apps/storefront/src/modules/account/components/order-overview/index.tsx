"use client"

import { Button } from "@medusajs/ui"

import OrderCard from "../order-card"
import { Link } from "@i18n/navigation"
import type { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  const t = useTranslations("OrderOverview")

  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b border-gray-200 pb-6 last:pb-0 last:border-none"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4"
      data-testid="no-orders-container"
    >
      <h2 className="text-large-semi">{t("nothingToSeeHere")}</h2>
      <p className="text-base-regular">
        {t("noOrdersYet")} {":)"}
      </p>
      <div className="mt-4">
        <Link href="/">
          <Button data-testid="continue-shopping-button">
            {t("continueShopping")}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default OrderOverview

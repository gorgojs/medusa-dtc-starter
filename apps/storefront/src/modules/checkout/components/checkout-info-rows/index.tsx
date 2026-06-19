"use client"

import { useState } from "react"
import { ChevronRight } from "@medusajs/icons"
import MapPin from "@modules/common/icons/map-pin"
import User from "@modules/common/icons/user"
import type { HttpTypes } from "@medusajs/types"
import CheckoutAddressSheet from "@modules/checkout/components/checkout-address-sheet"
import CheckoutContactsSheet from "@modules/checkout/components/checkout-contacts-sheet"
import { useTranslations } from "next-intl"
import clsx from "clsx"

interface CheckoutInfoRowsProps {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}

export default function CheckoutInfoRows({
  cart,
  customer,
}: CheckoutInfoRowsProps) {
  const t = useTranslations("CheckoutPage")
  const [addressOpen, setAddressOpen] = useState(false)
  const [contactsOpen, setContactsOpen] = useState(false)

  const addr = cart.shipping_address
  const meta = cart.metadata as Record<string, string> | null

  const hasAddress = !!addr?.address_1
  const addressText = hasAddress
    ? [addr?.address_1, addr?.city, addr?.postal_code].filter(Boolean).join(", ")
    : null

  // Buyer info: prefer metadata (set by contacts modal), fall back to shipping_address
  const buyerFirstName = meta?.contact_first_name || addr?.first_name || ""
  const buyerLastName = meta?.contact_last_name || addr?.last_name || ""
  const buyerPhone = meta?.contact_phone || addr?.phone || ""
  const buyerName = [buyerFirstName, buyerLastName].filter(Boolean).join(" ")
  const hasContacts = !!(buyerName || cart.email)

  const hasDifferentRecipient = meta?.has_different_recipient === "true"
  const recipientName = [addr?.first_name, addr?.last_name].filter(Boolean).join(" ")
  const recipientPhone = addr?.phone || ""

  return (
    <div className="flex flex-col gap-y-6">
      {/* Address row */}
      <button
        onClick={() => setAddressOpen(true)}
        className="flex items-center justify-between w-full gap-x-2 py-2 text-left"
        data-testid="checkout-address-row"
      >
        <div className="flex items-center gap-x-2">
          <span
            className={clsx(
              "flex-shrink-0",
              hasAddress ? "text-ui-fg-subtle" : "text-ui-fg-base"
            )}
          >
            <MapPin size={24} />
          </span>
          <div className="flex flex-col">
            <h2
              className={clsx(
                "h2-docs",
                hasAddress ? "text-ui-fg-subtle" : "text-ui-fg-base"
              )}
            >
              {t("addressHeading")}
            </h2>
            {addressText && (
              <span className="txt-compact-small text-ui-fg-base">
                {addressText}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="text-ui-fg-muted flex-shrink-0" />
      </button>

      <div className="h-px bg-ui-border-base w-full" />

      {/* Contacts section */}
      <div className="flex flex-col gap-y-1">
        <button
          onClick={() => setContactsOpen(true)}
          className="flex items-center justify-between w-full gap-x-2 py-2 text-left"
          data-testid="checkout-contacts-row"
        >
          <div className="flex items-center gap-x-2">
            <span
              className={clsx(
                "flex-shrink-0",
                hasContacts ? "text-ui-fg-subtle" : "text-ui-fg-base"
              )}
            >
              <User size={24} />
            </span>
            <div className="flex flex-col">
              <h2
                className={clsx(
                  "h2-docs",
                  hasContacts ? "text-ui-fg-subtle" : "text-ui-fg-base"
                )}
              >
                {t("contactsHeading")}
              </h2>
              {hasContacts && (
                <span className="txt-small text-ui-fg-base flex gap-x-2">
                  {buyerName && <span>{buyerName}</span>}
                  {buyerPhone && (
                    <span className="text-ui-fg-subtle">{buyerPhone}</span>
                  )}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="text-ui-fg-muted flex-shrink-0" />
        </button>

        {/* Recipient sub-row — indented to align with contact name text (icon 24px + gap 8px = 32px) */}
        {hasDifferentRecipient && (recipientName || recipientPhone) && (
          <div className="flex items-center gap-x-2 pl-8">
            <span className="txt-small text-ui-fg-subtle">{t("recipientLabel")}</span>
            {recipientName && (
              <span className="txt-small text-ui-fg-base">{recipientName}</span>
            )}
            {recipientPhone && (
              <span className="txt-small text-ui-fg-subtle">{recipientPhone}</span>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-ui-border-base w-full" />

      <CheckoutAddressSheet
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        cart={cart}
        customer={customer}
      />

      <CheckoutContactsSheet
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
        cart={cart}
      />
    </div>
  )
}

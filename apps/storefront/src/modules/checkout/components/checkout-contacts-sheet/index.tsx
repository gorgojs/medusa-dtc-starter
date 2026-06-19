"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { setAddresses, updateCart } from "@lib/data/cart"
import type { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import { CheckoutModal } from "@modules/checkout/components/checkout-modal"
import { useTranslations } from "next-intl"

interface CheckoutContactsSheetProps {
  open: boolean
  onClose: () => void
  cart: HttpTypes.StoreCart
}

export default function CheckoutContactsSheet({
  open,
  onClose,
  cart,
}: CheckoutContactsSheetProps) {
  const t = useTranslations("CheckoutPage")
  const router = useRouter()
  const addr = cart.shipping_address
  const meta = cart.metadata as Record<string, string> | null

  const wasDifferentRecipient = meta?.has_different_recipient === "true"

  const [isDifferentRecipient, setIsDifferentRecipient] = useState(wasDifferentRecipient)
  const [formData, setFormData] = useState({
    first_name: meta?.contact_first_name || addr?.first_name || "",
    last_name: meta?.contact_last_name || addr?.last_name || "",
    email: cart.email || "",
    phone: meta?.contact_phone || addr?.phone || "",
    recipient_first_name: wasDifferentRecipient ? addr?.first_name || "" : "",
    recipient_last_name: wasDifferentRecipient ? addr?.last_name || "" : "",
    recipient_phone: wasDifferentRecipient ? addr?.phone || "" : "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const fd = new FormData()
    fd.set("shipping_address.address_1", addr?.address_1 || "")
    fd.set("shipping_address.company", addr?.company || "")
    fd.set("shipping_address.postal_code", addr?.postal_code || "")
    fd.set("shipping_address.city", addr?.city || "")
    fd.set("shipping_address.province", addr?.province || "")
    fd.set("shipping_address.country_code", addr?.country_code || "")
    fd.set("same_as_billing", "on")
    fd.set("email", formData.email)

    if (isDifferentRecipient) {
      fd.set("shipping_address.first_name", formData.recipient_first_name)
      fd.set("shipping_address.last_name", formData.recipient_last_name)
      fd.set("shipping_address.phone", formData.recipient_phone)
    } else {
      fd.set("shipping_address.first_name", formData.first_name)
      fd.set("shipping_address.last_name", formData.last_name)
      fd.set("shipping_address.phone", formData.phone)
    }

    const result = await setAddresses(null, fd)
    if (result) {
      setError(result as string)
      setIsSubmitting(false)
      return
    }

    await updateCart({
      metadata: {
        contact_first_name: formData.first_name,
        contact_last_name: formData.last_name,
        contact_phone: formData.phone,
        has_different_recipient: isDifferentRecipient ? "true" : "false",
      },
    } as HttpTypes.StoreUpdateCart)

    setIsSubmitting(false)
    onClose()
    router.refresh()
  }

  return (
    <CheckoutModal open={open} onClose={onClose} title={t("contactsModalTitle")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("fieldFirstName")}
            name="first_name"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={handleChange}
            required
            data-testid="shipping-first-name-input"
          />
          <Input
            label={t("fieldLastName")}
            name="last_name"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={handleChange}
            required
            data-testid="shipping-last-name-input"
          />
        </div>

        <Input
          label={t("fieldEmail")}
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />

        <Input
          label={t("fieldPhone")}
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />

        <label className="flex items-center gap-x-2 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={isDifferentRecipient}
            onChange={(e) => setIsDifferentRecipient(e.target.checked)}
            className="w-4 h-4 rounded border-ui-border-base accent-ui-fg-interactive"
          />
          <span className="txt-compact-small text-ui-fg-base">
            {t("recipientCheckbox")}
          </span>
        </label>

        {isDifferentRecipient && (
          <div className="flex flex-col gap-y-3 pt-1">
            <p className="txt-compact-small-plus text-ui-fg-subtle">
              {t("recipientHeading")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("fieldFirstName")}
                name="recipient_first_name"
                autoComplete="given-name"
                value={formData.recipient_first_name}
                onChange={handleChange}
                required
              />
              <Input
                label={t("fieldLastName")}
                name="recipient_last_name"
                autoComplete="family-name"
                value={formData.recipient_last_name}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label={t("fieldPhone")}
              name="recipient_phone"
              autoComplete="tel"
              value={formData.recipient_phone}
              onChange={handleChange}
            />
          </div>
        )}

        {error && <p className="txt-compact-small text-rose-500">{error}</p>}

        <div className="flex justify-end gap-x-2 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 px-4 rounded-md txt-compact-small-plus text-ui-fg-base bg-ui-bg-base border border-ui-border-base hover:bg-ui-bg-field transition-colors"
          >
            {t("close")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center h-8 px-4 rounded-md txt-compact-small-plus text-white disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#27272A" }}
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </CheckoutModal>
  )
}

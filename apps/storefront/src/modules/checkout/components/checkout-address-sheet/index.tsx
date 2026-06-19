"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { setAddresses } from "@lib/data/cart"
import type { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import { CheckoutModal } from "@modules/checkout/components/checkout-modal"
import { useTranslations } from "next-intl"

interface CheckoutAddressSheetProps {
  open: boolean
  onClose: () => void
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}

export default function CheckoutAddressSheet({
  open,
  onClose,
  cart,
  customer,
}: CheckoutAddressSheetProps) {
  const t = useTranslations("CheckoutPage")
  const router = useRouter()
  const addr = cart.shipping_address
  const [formData, setFormData] = useState({
    "shipping_address.address_1": addr?.address_1 || "",
    "shipping_address.company": addr?.company || "",
    "shipping_address.postal_code": addr?.postal_code || "",
    "shipping_address.city": addr?.city || "",
    "shipping_address.province": addr?.province || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await setAddresses(null, fd)
    setIsSubmitting(false)
    if (result) {
      setError(result as string)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <CheckoutModal open={open} onClose={onClose} title={t("addressModalTitle")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
        <input type="hidden" name="shipping_address.first_name" value={addr?.first_name || ""} />
        <input type="hidden" name="shipping_address.last_name" value={addr?.last_name || ""} />
        <input type="hidden" name="shipping_address.phone" value={addr?.phone || ""} />
        <input type="hidden" name="email" value={cart.email || ""} />
        <input type="hidden" name="same_as_billing" value="on" />
        <input type="hidden" name="shipping_address.country_code" value={addr?.country_code || cart.region?.countries?.[0]?.iso_2 || ""} />

        <Input
          label={t("fieldAddress")}
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />

        <Input
          label={t("fieldCompany")}
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("fieldPostalCode")}
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-postal-code-input"
          />
          <Input
            label={t("fieldCity")}
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            data-testid="shipping-city-input"
          />
        </div>

        <Input
          label={t("fieldProvince")}
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />

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

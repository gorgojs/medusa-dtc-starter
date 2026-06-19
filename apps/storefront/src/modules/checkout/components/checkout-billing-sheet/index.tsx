"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { updateCart } from "@lib/data/cart"
import type { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import { CheckoutModal } from "@modules/checkout/components/checkout-modal"
import { useTranslations } from "next-intl"

interface CheckoutBillingSheetProps {
  open: boolean
  onClose: () => void
  cart: HttpTypes.StoreCart
}

export default function CheckoutBillingSheet({
  open,
  onClose,
  cart,
}: CheckoutBillingSheetProps) {
  const t = useTranslations("CheckoutPage")
  const router = useRouter()
  const shippingAddr = cart.shipping_address
  const billingAddr = cart.billing_address

  const billingDiffersFromShipping =
    !!billingAddr?.address_1 &&
    billingAddr.address_1 !== shippingAddr?.address_1

  const [sameAsShipping, setSameAsShipping] = useState(!billingDiffersFromShipping)
  const [formData, setFormData] = useState({
    address_1: billingAddr?.address_1 || "",
    company: billingAddr?.company || "",
    postal_code: billingAddr?.postal_code || "",
    city: billingAddr?.city || "",
    province: billingAddr?.province || "",
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
    try {
      if (sameAsShipping) {
        await updateCart({
          billing_address: {
            first_name: shippingAddr?.first_name || "",
            last_name: shippingAddr?.last_name || "",
            address_1: shippingAddr?.address_1 || "",
            company: shippingAddr?.company || "",
            postal_code: shippingAddr?.postal_code || "",
            city: shippingAddr?.city || "",
            country_code: shippingAddr?.country_code || "",
            province: shippingAddr?.province || "",
            phone: shippingAddr?.phone || "",
          },
        })
      } else {
        await updateCart({
          billing_address: {
            first_name: shippingAddr?.first_name || "",
            last_name: shippingAddr?.last_name || "",
            address_1: formData.address_1,
            company: formData.company,
            postal_code: formData.postal_code,
            city: formData.city,
            country_code: shippingAddr?.country_code || "",
            province: formData.province,
            phone: shippingAddr?.phone || "",
          },
        })
      }
      onClose()
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CheckoutModal open={open} onClose={onClose} title={t("billingHeading")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
        <label className="flex items-center gap-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsShipping}
            onChange={(e) => setSameAsShipping(e.target.checked)}
            className="w-4 h-4 rounded border-ui-border-base accent-ui-fg-interactive"
          />
          <span className="txt-compact-small text-ui-fg-base">
            {t("billingSameAsShipping")}
          </span>
        </label>

        {!sameAsShipping && (
          <div className="flex flex-col gap-y-3 pt-1">
            <Input
              label={t("fieldAddress")}
              name="address_1"
              autoComplete="address-line1"
              value={formData.address_1}
              onChange={handleChange}
              required
            />
            <Input
              label={t("fieldCompany")}
              name="company"
              value={formData.company}
              onChange={handleChange}
              autoComplete="organization"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("fieldPostalCode")}
                name="postal_code"
                autoComplete="postal-code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
              <Input
                label={t("fieldCity")}
                name="city"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label={t("fieldProvince")}
              name="province"
              autoComplete="address-level1"
              value={formData.province}
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

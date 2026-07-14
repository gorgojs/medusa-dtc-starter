"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { updateCart } from "@lib/data/cart"
import type { HttpTypes } from "@medusajs/types"
import { CheckoutModal } from "@modules/checkout/components/checkout-modal"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useTranslations } from "next-intl"
import DaDataAddressInput, {
  type AddressFields,
} from "@modules/common/components/dadata-address-input"

interface CheckoutBillingSheetProps {
  open: boolean
  onClose: () => void
  initialSameAsShipping: boolean
  onSaved?: (sameAsShipping: boolean) => void
  cart: HttpTypes.StoreCart
}

export default function CheckoutBillingSheet({
  open,
  onClose,
  initialSameAsShipping,
  onSaved,
  cart,
}: CheckoutBillingSheetProps) {
  const t = useTranslations("CheckoutPage")
  const router = useRouter()
  const shippingAddr = cart.shipping_address
  const billingAddr = cart.billing_address

  const [sameAsShipping, setSameAsShipping] = useState(initialSameAsShipping)
  const [addressFields, setAddressFields] = useState<AddressFields>({
    address_1: billingAddr?.address_1 || "",
    postal_code: billingAddr?.postal_code || "",
    city: billingAddr?.city || "",
    province: billingAddr?.province || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setSameAsShipping(initialSameAsShipping)
      setError(null)
    }
  }, [initialSameAsShipping, open])

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
            address_1: addressFields.address_1,
            company: shippingAddr?.company || "",
            postal_code: addressFields.postal_code,
            city: addressFields.city,
            country_code: shippingAddr?.country_code || "",
            province: addressFields.province,
            phone: shippingAddr?.phone || "",
          },
        })
      }
      onSaved?.(sameAsShipping)
      onClose()
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
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
          <div className="pt-1">
            <DaDataAddressInput
              values={addressFields}
              onChange={setAddressFields}
              required
            />
          </div>
        )}

        <ErrorMessage error={error} />

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

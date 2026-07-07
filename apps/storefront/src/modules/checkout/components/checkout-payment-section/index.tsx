"use client"

import { useState, useEffect } from "react"
import { initiatePaymentSession } from "@lib/data/cart"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import compareAddresses from "@lib/util/compare-addresses"
import { CreditCard } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import PaymentButton from "@modules/checkout/components/payment-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { StripeCardContainer } from "@modules/checkout/components/payment-container"
import CheckoutBillingSheet from "@modules/checkout/components/checkout-billing-sheet"
import { useTranslations } from "next-intl"
import clsx from "clsx"

interface CheckoutPaymentSectionProps {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}

export default function CheckoutPaymentSection({
  cart,
  availablePaymentMethods,
}: CheckoutPaymentSectionProps) {
  const t = useTranslations("CheckoutPage")
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const [error, setError] = useState<string | null>(null)
  const [, setCardBrand] = useState<string | null>(null)
  const [, setCardComplete] = useState(false)
  const [billingOpen, setBillingOpen] = useState(false)
  const [showBillingDetails, setShowBillingDetails] = useState(false)

  // Re-initiate payment session when it gets cleared (e.g. after promo code change)
  useEffect(() => {
    if (selectedPaymentMethod && !activeSession && !paidByGiftcard) {
      initiatePaymentSession(cart, { provider_id: selectedPaymentMethod }).catch(
        (e) => setError(e instanceof Error ? e.message : String(e))
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.payment_collection?.payment_sessions])

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const handleSelectPayment = async (providerId: string) => {
    setError(null)
    setSelectedPaymentMethod(providerId)
    try {
      await initiatePaymentSession(cart, { provider_id: providerId })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const billingAddr = cart.billing_address
  const billingSameAsShipping = !!(
    cart.shipping_address &&
    billingAddr &&
    compareAddresses(cart.shipping_address, billingAddr)
  )
  const billingText = billingAddr
    ? [billingAddr.address_1, billingAddr.city, billingAddr.postal_code]
        .filter(Boolean)
        .join(", ")
    : null

  return (
    <div className="flex flex-col gap-y-6">
      {/* Payment methods */}
      {!paidByGiftcard && availablePaymentMethods.length > 0 && (
        <div className="flex flex-col gap-y-3">
          <h2 className="h2-docs">{t("paymentHeading")}</h2>

          <div className="flex gap-x-2 overflow-x-auto no-scrollbar pb-1">
            {availablePaymentMethods.map((method) => {
              const info = paymentInfoMap[method.id]
              const isSelected = selectedPaymentMethod === method.id

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleSelectPayment(method.id)}
                  className={clsx(
                    "flex-shrink-0 w-[111px] p-[10px] rounded-[6px] border text-left transition-colors",
                    isSelected
                      ? "border-ui-border-interactive bg-ui-bg-base"
                      : "border-ui-border-base bg-ui-bg-base hover:border-ui-border-interactive/50"
                  )}
                >
                  <div className="flex flex-col gap-y-2">
                    <div className="w-6 h-6 rounded-full bg-ui-bg-component border border-ui-border-base flex items-center justify-center">
                      {info?.icon || <CreditCard className="w-3 h-3" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="txt-compact-xsmall-plus text-ui-fg-base leading-tight">
                        {info?.title || method.id}
                      </span>
                      <span className="txt-compact-xsmall text-ui-fg-subtle">
                        {method.id.includes("stripe")
                          ? "Stripe"
                          : method.id.includes("paypal")
                          ? "PayPal"
                          : ""}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Stripe card input */}
          {isStripeLike(selectedPaymentMethod) && (
            <div className="mt-2">
              <StripeCardContainer
                paymentProviderId={selectedPaymentMethod}
                selectedPaymentOptionId={selectedPaymentMethod}
                paymentInfoMap={paymentInfoMap}
                setCardBrand={setCardBrand}
                setError={setError}
                setCardComplete={setCardComplete}
              />
            </div>
          )}
        </div>
      )}

      {paidByGiftcard && (
        <div className="flex flex-col gap-y-1">
          <h2 className="h2-docs">{t("paymentHeading")}</h2>
          <p className="txt-compact-small text-ui-fg-subtle">{t("giftCard")}</p>
        </div>
      )}

      {/* Billing address */}
      {billingSameAsShipping && !showBillingDetails ? (
        <label className="flex items-center gap-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked
            onChange={() => setShowBillingDetails(true)}
            className="w-4 h-4 rounded border-ui-border-base accent-ui-fg-interactive"
          />
          <span className="txt-compact-small text-ui-fg-base">
            {t("billingSameAsShipping")}
          </span>
        </label>
      ) : (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <h2 className="h2-docs">{t("billingHeading")}</h2>
            <button
              type="button"
              onClick={() => setBillingOpen(true)}
              className="txt-compact-small-plus text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
            >
              {t("edit")}
            </button>
          </div>
          {billingText ? (
            <p className="txt-medium text-ui-fg-base">{billingText}</p>
          ) : (
            <p className="txt-compact-small text-ui-fg-muted">
              {t("sameAsShipping")}
            </p>
          )}
        </div>
      )}

      <CheckoutBillingSheet
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
        initialSameAsShipping={billingSameAsShipping && !showBillingDetails}
        onSaved={(sameAsShipping) => setShowBillingDetails(!sameAsShipping)}
        cart={cart}
      />

      <ErrorMessage error={error} data-testid="payment-method-error-message" />

      <div className="flex flex-col gap-y-3">
        <PaymentButton cart={cart} data-testid="submit-order-button" />
        <p className="txt-compact-2xsmall text-ui-fg-subtle text-center px-2">
          {t.rich("legal", {
            terms: (chunks) => (
              <a href="#" className="underline">
                {chunks}
              </a>
            ),
            termsOfUse: (chunks) => (
              <a href="#" className="underline">
                {chunks}
              </a>
            ),
            returnPolicy: (chunks) => (
              <a href="#" className="underline">
                {chunks}
              </a>
            ),
            privacyPolicy: (chunks) => (
              <a href="#" className="underline">
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  )
}

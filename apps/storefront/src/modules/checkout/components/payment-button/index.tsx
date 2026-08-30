"use client"

import { isManual, isPaymentSessionReady, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useCartUpdate } from "@modules/checkout/context/cart-update-context"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import type React from "react"
import { useState } from "react"
import { unstable_rethrow } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  selectedPaymentMethod?: string
  "data-testid": string
  onError?: (message: string | null) => void
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  selectedPaymentMethod,
  "data-testid": dataTestId,
  onError,
}) => {
  const t = useTranslations("PaymentButton")
  const locale = useLocale()
  const { isCartUpdating } = useCartUpdate()

  const activePaymentMethod =
    selectedPaymentMethod ??
    cart.payment_collection?.payment_sessions?.[0]?.provider_id ??
    ""

  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1 ||
    !activePaymentMethod ||
    !isPaymentSessionReady(activePaymentMethod, cart)

  const payLabel = (
    <>
      {t("placeOrder")}
      <span className="text-ui-fg-disabled">
        {convertToLocale({
          amount: cart.total ?? 0,
          currency_code: cart.currency_code,
          locale,
        })}
      </span>
    </>
  )

  switch (true) {
    case isStripeLike(activePaymentMethod):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          label={payLabel}
          cartUpdating={isCartUpdating}
          data-testid={dataTestId}
        />
      )
    case isManual(activePaymentMethod):
      return (
        <ManualTestPaymentButton
          notReady={notReady}
          label={payLabel}
          cartUpdating={isCartUpdating}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled size="large" className="w-full">{t("selectPaymentMethod")}</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  label,
  cartUpdating,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  label: React.ReactNode
  cartUpdating: boolean
  "data-testid"?: string
}) => {
  const locale = useLocale()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch((err) => {
      // A successful `placeOrder` ends in `redirect()`, which reaches this
      // catch as a NEXT_REDIRECT control-flow error rather than a failure.
      // Swallowing it would paint "something went wrong" over a placed order.
      unstable_rethrow(err)

      setErrorMessage(err.message)
      setSubmitting(false)
    })
  }

  const stripe = useStripe()
  const elements = useElements()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) {
      return
    }

    setSubmitting(true)

    await stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/api/payment-return?cart_id=${cart.id}&locale=${locale}`,
          payment_method_data: {
            billing_details: {
              name:
                cart.billing_address?.first_name +
                " " +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        },
        // Only leave the site when the selected method actually requires it, so
        // card payments still complete inline.
        redirect: "if_required",
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
            return
          }

          setErrorMessage(error.message || null)
          setSubmitting(false)
          return
        }

        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          onPaymentCompleted()
          return
        }

        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting || cartUpdating}
        className="w-full"
        data-testid={dataTestId}
      >
        {label}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({
  notReady,
  label,
  cartUpdating,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  label: React.ReactNode
  cartUpdating: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch((err) => {
      // See the note in StripePaymentButton: the redirect that follows a
      // placed order arrives here as an error and must not be reported as one.
      unstable_rethrow(err)

      setErrorMessage(err.message)
      setSubmitting(false)
    })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting || cartUpdating}
        onClick={handlePayment}
        size="large"
        className="w-full"
        data-testid={dataTestId ?? "submit-order-button"}
      >
        {label}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton

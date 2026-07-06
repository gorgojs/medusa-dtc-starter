"use client"

import { isManual, isPaymentSessionReady, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useCartUpdate } from "@modules/checkout/context/cart-update-context"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import type React from "react"
import { useState } from "react"
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
      <span className="text-white/80">
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
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
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
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
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
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
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

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import { CartUpdateProvider } from "@modules/checkout/context/cart-update-context"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <PaymentWrapper cart={cart}>
      <CartUpdateProvider>
        <div className="overflow-x-hidden">
          <div className="lg:content-container flex flex-col lg:grid lg:grid-cols-[7fr_5fr] min-h-screen">
            <CheckoutForm cart={cart} customer={customer} />
            <CheckoutSummary cart={cart} />
          </div>
        </div>
      </CartUpdateProvider>
    </PaymentWrapper>
  )
}

import {
  getStoreAddress,
  getStorePhone,
  STORE_EMAIL,
  STORE_NAME,
} from "../constants";
import type { EmailTranslations } from "../types";

export const en: EmailTranslations = {
  layout: {
    copyright: (year) => `© ${year} ${STORE_NAME}. All rights reserved.`,
    contactLine: `${getStoreAddress("en")} · ${STORE_EMAIL} · ${getStorePhone("en")}`,
  },
  common: {
    orderSummary: "Order Summary",
    total: "Total",
    item: "Item",
    myOrders: "My Orders",
    trackOrder: "Track Order",
    questionsPrefix: "If you have any questions, write to us at",
    orCall: "or call",
  },
  orderPlaced: {
    preview: (id) => `Order #${id} successfully placed`,
    subject: (id) => `Order #${id} placed — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, your order is placed!`,
    headingAnon: "Your order is placed!",
    bodyOrder: (id) =>
      `Order <strong>#${id}</strong> has been successfully placed.`,
    deliveryCity: (city) => ` Delivering to ${city}.`,
    watchStatus: "You can track your order status in your account.",
    textFallback: (id) =>
      `Order #${id} has been placed.\n\nWe are preparing your order and will dispatch it shortly.`,
  },
  orderCompleted: {
    preview: (id) => `Order #${id} completed — thank you for your purchase!`,
    subject: (id) => `Order #${id} completed — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, your order is complete!`,
    headingAnon: "Your order is complete!",
    bodyOrder: (id) =>
      `Order <strong>#${id}</strong> has been completed. Thank you for choosing us!`,
    deliveryCity: (city) => ` Delivered to ${city}.`,
    bodyPromo:
      "We'd love to see you again. Check out new arrivals in our store.",
    textFallback: (id) =>
      `Order #${id} completed. Thank you for your purchase!`,
  },
  fulfillment: {
    preview: (id) => `Order #${id} shipped`,
    subject: (id) => `Order #${id} shipped — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, your order is on its way!`,
    headingAnon: "Your order is on its way!",
    bodyOrder: (id) =>
      `Order <strong>#${id}</strong> has been handed to the delivery service.`,
    deliveryCity: (city) => ` Delivering to ${city}.`,
    trackingTitle: "Tracking Information",
    trackLabel: "Tracking number:",
    noTracking:
      "The tracking number will be added to your order in your account once the parcel is handed to the carrier.",
    deliveryTime:
      "Standard delivery time is 1–7 business days depending on your region.",
    textTracking: (numbers) => `\nTracking number: ${numbers}`,
    textDelivery: "Standard delivery time is 1–7 business days.",
    textFallback: (id) => `Order #${id} has been shipped.`,
  },
  payment: {
    preview: (id) => `Order #${id} successfully paid`,
    subject: (id) => `Order #${id} paid — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, your order is paid!`,
    headingAnon: "Your order is paid!",
    bodyOrder: (id) =>
      `Order <strong>#${id}</strong> has been successfully paid. We are now preparing it for dispatch.`,
    watchStatus: "You can track your order status in your account.",
    textFallback: (id) =>
      `Order #${id} has been paid.\n\nWe are preparing your order and will dispatch it shortly.`,
  },
  passwordReset: {
    preview: "Password reset — link valid for 15 minutes",
    subject: `Password reset — ${STORE_NAME}`,
    heading: "Password Reset",
    body: (email) =>
      `We received a request to reset the password for <strong>${email}</strong>. Click the button below to set a new password.`,
    button: "Reset Password",
    hint: "The link is valid for <strong>15 minutes</strong>. If you didn't request a password reset, simply ignore this email.",
    textFallback: (url) =>
      `Password Reset\n\nTo reset your password, follow the link (valid for 15 minutes):\n${url}\n\nIf you didn't request a password reset, simply ignore this email.`,
  },
  orderTransfer: {
    preview: (id) => `Order #${id} transfer request`,
    subject: (id) => `Order #${id} transfer request — ${STORE_NAME}`,
    heading: "Order Transfer Request",
    body: (id) =>
      `A request was made to transfer order <strong>#${id}</strong> to another account. If this was you, confirm the transfer using the button below. If not, simply ignore this email.`,
    button: "Review request",
    hint: "The order will only be transferred after your confirmation. If you didn't request a transfer, nothing will happen to your order.",
    textFallback: (id, url) =>
      `Order #${id} transfer request\n\nTo review the request, follow the link:\n${url}\n\nIf you didn't request a transfer, simply ignore this email.`,
  },
  welcome: {
    preview: `Welcome to ${STORE_NAME}!`,
    subject: `Welcome to ${STORE_NAME}!`,
    headingWithName: (name) => `Welcome, ${name}!`,
    headingAnon: "Welcome!",
    body: "Thanks for signing up! Your account is ready — now you can check out faster, track your orders, and save delivery addresses in your account.",
    button: "Start shopping",
    textFallback: (url) =>
      `Welcome!\n\nThanks for signing up. Your account is ready.\nStart shopping: ${url}`,
  },
};

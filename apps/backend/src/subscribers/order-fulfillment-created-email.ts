import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  INotificationModuleService,
  Logger,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import { createElement } from "react";
import { OrderFulfillmentCreatedEmail } from "../emails/order-fulfillment-created";
import {
  getEmailTranslator,
  getLocaleFromMetadata,
  resolveEmailLocale,
  STOREFRONT_URL,
} from "../emails/i18n";

export default async function orderFulfillmentCreatedEmailHandler({
  event,
  container,
}: SubscriberArgs<{
  order_id: string;
  fulfillment_id: string;
  no_notification?: boolean;
}>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger;

  const orderId = event.data.order_id;
  if (!orderId) {
    logger.warn("[order-shipped-email] Missing order id in event payload");
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notificationService = container.resolve(
    Modules.NOTIFICATION,
  ) as INotificationModuleService;

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "customer_id",
      "currency_code",
      "locale",
      "customer.metadata",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.city",
      "shipping_address.country_code",
    ],
    filters: { id: orderId },
  });

  if (!orders.length) {
    logger.warn(`[order-shipped-email] Order not found: ${orderId}`);
    return;
  }

  const order = orders[0] as any;

  if (!order.email) {
    logger.warn(`[order-shipped-email] No email on order ${orderId}, skipping`);
    return;
  }

  let fulfillment: any = undefined;
  const fulfillmentId = event.data.fulfillment_id;

  if (fulfillmentId) {
    try {
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: [
          "id",
          "provider_id",
          "tracking_numbers",
          "tracking_links.tracking_number",
          "tracking_links.url",
        ],
        filters: { id: fulfillmentId },
      });
      fulfillment = fulfillments[0] ?? undefined;
    } catch {}
  }

  const locale = resolveEmailLocale(
    order.locale,
    getLocaleFromMetadata(order.customer?.metadata),
  );
  const { t } = getEmailTranslator(locale);
  const id = order.display_id ?? order.id;

  const html = await render(
    createElement(OrderFulfillmentCreatedEmail, { order, fulfillment, locale }),
  );

  const trackingInfo = fulfillment?.tracking_numbers?.length
    ? t("Fulfillment.textTracking", {
        numbers: fulfillment.tracking_numbers.join(", "),
      })
    : "";

  const text = [
    t("Fulfillment.textFallback", { id }),
    trackingInfo,
    "",
    t("Fulfillment.textDelivery"),
    "",
    `${STOREFRONT_URL}/account/orders`,
  ].join("\n");

  try {
    await notificationService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-shipped",
      trigger_type: event.name,
      resource_id: order.id,
      resource_type: "order",
      receiver_id: order.customer_id || undefined,
      idempotency_key: `order-shipped:${order.id}:${fulfillmentId ?? "nofulfillment"}`,
      content: {
        subject: t("Fulfillment.subject", { id }),
        html,
        text,
      },
    } as any);

    logger.info(
      `[order-shipped-email] Sent to ${order.email} for order ${order.id} (locale: ${locale})`,
    );
  } catch (err: any) {
    logger.error(
      `[order-shipped-email] Failed to send notification: ${err?.message}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
};

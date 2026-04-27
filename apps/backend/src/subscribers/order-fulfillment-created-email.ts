import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  INotificationModuleService,
  Logger,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import { createElement } from "react";
import { OrderFulfillmentCreatedEmail } from "../emails/order-fulfillment-created";
import { getLang, emailTranslations, STOREFRONT_URL } from "../emails/i18n";

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

  const lang = getLang();
  const s = emailTranslations[lang];
  const displayId = order.display_id ?? order.id;

  const html = await render(
    createElement(OrderFulfillmentCreatedEmail, { order, fulfillment, lang }),
  );

  const trackingInfo = fulfillment?.tracking_numbers?.length
    ? s.fulfillment.textTracking(fulfillment.tracking_numbers.join(", "))
    : "";

  const text = [
    s.fulfillment.textFallback(displayId),
    trackingInfo,
    "",
    s.fulfillment.textDelivery,
    "",
    `${STOREFRONT_URL}/account/orders`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

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
        subject: s.fulfillment.subject(displayId),
        html,
        text,
      },
    } as any);

    logger.info(
      `[order-shipped-email] Sent to ${order.email} for order ${order.id} (lang: ${lang})`,
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

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  INotificationModuleService,
  Logger,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import { createElement } from "react";
import { OrderTransferRequestEmail } from "../emails/order-transfer-request";
import { getLang, emailTranslations } from "../emails/i18n";

const storefrontUrl = (
  process.env.STOREFRONT_URL || "https://rustarter.example"
).replace(/\/$/, "");
const countryCode = process.env.STOREFRONT_DEFAULT_COUNTRY || "ru";

export default async function orderTransferRequestedEmailHandler({
  event,
  container,
}: SubscriberArgs<{ id: string; order_change_id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger;

  const { id: orderId, order_change_id: orderChangeId } = event.data;

  if (!orderId || !orderChangeId) {
    logger.warn(
      "[order-transfer-email] Missing order id or order change id in event payload",
    );
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notificationService = container.resolve(
    Modules.NOTIFICATION,
  ) as INotificationModuleService;

  const { data: orderChanges } = await query.graph({
    entity: "order_change",
    fields: ["id", "actions.action", "actions.details"],
    filters: { id: orderChangeId },
  });

  const orderChange = orderChanges[0] as any;
  const transferAction = orderChange?.actions?.find(
    (a: any) => a.action === "TRANSFER_CUSTOMER",
  );
  const token = transferAction?.details?.token as string | undefined;

  if (!token) {
    logger.warn(
      `[order-transfer-email] No transfer token found for order change ${orderChangeId}`,
    );
    return;
  }

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "shipping_address.country_code"],
    filters: { id: orderId },
  });

  const order = orders[0] as any;
  const recipient =
    (transferAction?.details?.original_email as string | undefined) ||
    order?.email;

  if (!recipient) {
    logger.warn(
      `[order-transfer-email] No recipient email for order ${orderId}, skipping`,
    );
    return;
  }

  const lang = getLang(order?.shipping_address?.country_code);
  const s = emailTranslations[lang];
  const displayId = order?.display_id ?? orderId;

  const transferUrl = `${storefrontUrl}/${countryCode}/order/${orderId}/transfer/${encodeURIComponent(token)}`;

  const html = await render(
    createElement(OrderTransferRequestEmail, { displayId, transferUrl, lang }),
  );
  const text = s.orderTransfer.textFallback(displayId, transferUrl);

  try {
    await notificationService.createNotifications({
      to: recipient,
      channel: "email",
      template: "order-transfer-request",
      trigger_type: event.name,
      resource_id: orderId,
      resource_type: "order",
      idempotency_key: `order-transfer:${orderId}:${token}`,
      content: {
        subject: s.orderTransfer.subject(displayId),
        html,
        text,
      },
    } as any);

    logger.info(
      `[order-transfer-email] Sent to ${recipient} for order ${orderId} (lang: ${lang})`,
    );
  } catch (err: any) {
    logger.error(
      `[order-transfer-email] Failed to send notification: ${err?.message}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.transfer_requested",
};

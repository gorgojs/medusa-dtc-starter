import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  INotificationModuleService,
  Logger,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import { createElement } from "react";
import { WelcomeEmail } from "../emails/welcome";
import { getLang, emailTranslations } from "../emails/i18n";

const storefrontUrl = (
  process.env.STOREFRONT_URL || "https://rustarter.example"
).replace(/\/$/, "");
const countryCode = process.env.STOREFRONT_DEFAULT_COUNTRY || "ru";

export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string } | { id: string }[]>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger;

  const payload = event.data;
  const ids = (Array.isArray(payload) ? payload : [payload])
    .map((entry) => entry?.id)
    .filter(Boolean);

  if (!ids.length) {
    logger.warn("[customer-created] No customer id in event payload");
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notificationService = container.resolve(
    Modules.NOTIFICATION,
  ) as INotificationModuleService;

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "has_account"],
    filters: { id: ids },
  });

  const lang = getLang(undefined);
  const s = emailTranslations[lang];
  const shopUrl = `${storefrontUrl}/${countryCode}/store`;

  for (const customer of customers) {
    if (!customer.has_account) {
      continue;
    }

    if (!customer.email) {
      logger.warn(
        `[customer-created] No email for customer ${customer.id}, skipping`,
      );
      continue;
    }

    const html = await render(
      createElement(WelcomeEmail, {
        firstName: customer.first_name,
        shopUrl,
        lang,
      }),
    );
    const text = s.welcome.textFallback(shopUrl);

    try {
      await notificationService.createNotifications({
        to: customer.email,
        channel: "email",
        template: "welcome",
        trigger_type: event.name,
        resource_id: customer.id,
        resource_type: "customer",
        receiver_id: customer.id,
        idempotency_key: `welcome:${customer.id}`,
        content: {
          subject: s.welcome.subject,
          html,
          text,
        },
      } as any);

      logger.info(
        `[customer-created] Welcome email sent to ${customer.email} (lang: ${lang})`,
      );
    } catch (err: any) {
      logger.error(
        `[customer-created] Failed to send welcome email: ${err?.message}`,
      );
    }
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
};

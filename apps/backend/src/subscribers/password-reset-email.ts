import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  INotificationModuleService,
  Logger,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import { createElement } from "react";
import { PasswordResetEmail } from "../emails/password-reset";

const storefrontUrl = (
  process.env.STOREFRONT_URL || "https://rustarter.example"
).replace(/\/$/, "");
const countryCode = process.env.STOREFRONT_DEFAULT_COUNTRY || "ru";

export default async function passwordResetEmailHandler({
  event,
  container,
}: SubscriberArgs<{
  entity_id: string;
  token: string;
  actor_type: string;
}>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger;

  const { entity_id: email, token, actor_type } = event.data;

  if (actor_type !== "customer") {
    return;
  }

  if (!email || !token) {
    logger.warn("[password-reset-email] Missing email or token in event payload");
    return;
  }

  const notificationService = container.resolve(
    Modules.NOTIFICATION,
  ) as INotificationModuleService;

  const resetUrl = `${storefrontUrl}/${countryCode}/account/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const html = await render(
    createElement(PasswordResetEmail, { email, token, resetUrl }),
  );

  const text = [
    "Сброс пароля",
    "",
    `Для сброса пароля перейдите по ссылке (действительна 15 минут):`,
    resetUrl,
    "",
    "Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.",
  ].join("\n");

  try {
    await notificationService.createNotifications({
      to: email,
      channel: "email",
      template: "password-reset",
      trigger_type: event.name,
      resource_id: email,
      resource_type: "customer",
      idempotency_key: `password-reset:${email}:${token}`,
      content: {
        subject: "Сброс пароля — gorgojs",
        html,
        text,
      },
    } as any);

    logger.info(`[password-reset-email] Sent to ${email}`);
  } catch (err: any) {
    logger.error(
      `[password-reset-email] Failed to send notification: ${err?.message}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};

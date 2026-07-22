import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  INotificationModuleService,
  Logger,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { render } from "@react-email/render";
import { createElement } from "react";
import { PasswordResetEmail } from "../emails/password-reset";
import { getLang, emailTranslations, STOREFRONT_URL } from "../emails/i18n";

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
    logger.warn(
      "[password-reset-email] Missing email or token in event payload",
    );
    return;
  }

  const notificationService = container.resolve(
    Modules.NOTIFICATION,
  ) as INotificationModuleService;

  // Password reset has no order context — fall back to env default locale
  const lang = getLang();
  const s = emailTranslations[lang];

  const resetUrl = `${STOREFRONT_URL}/account/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const html = await render(
    createElement(PasswordResetEmail, { email, token, resetUrl, lang }),
  );

  const text = s.passwordReset.textFallback(resetUrl);

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
        subject: s.passwordReset.subject,
        html,
        text,
      },
    } as any);

    logger.info(`[password-reset-email] Sent to ${email} (lang: ${lang})`);
  } catch (err: any) {
    logger.error(
      `[password-reset-email] Failed to send notification: ${err?.message}`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};

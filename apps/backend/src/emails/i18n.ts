export type EmailLang = "ru" | "en";

const RU_COUNTRIES = ["ru", "by", "kz"];

export function getLang(countryCode?: string | null): EmailLang {
  const envDefault = (process.env.STOREFRONT_DEFAULT_LOCALE ||
    "ru") as EmailLang;
  if (!countryCode) return envDefault;
  return RU_COUNTRIES.includes(countryCode.toLowerCase()) ? "ru" : envDefault;
}

const ru = {
  layout: {
    copyright: (year: number) => `© ${year} Gorgo. Все права защищены.`,
    contactLine: `${process.env.STORE_ADDRESS || "Москва, Россия"} · ${process.env.STORE_EMAIL || "demo@gorgojs.com"} · ${process.env.STORE_PHONE || "+7 111 11-11-11"}`,
  },
  common: {
    orderSummary: "Состав заказа",
    total: "Итого",
    item: "Товар",
    myOrders: "Мои заказы",
    trackOrder: "Отследить заказ",
    questionsPrefix: "Если у вас возникли вопросы, напишите нам на",
    orCall: "или позвоните",
  },
  orderPlaced: {
    preview: (id: string | number) => `Заказ #${id} успешно создан`,
    subject: (id: string | number) =>
      `Заказ #${id} создан — ${process.env.STORE_NAME || "Gorgo"}`,
    headingWithName: (name: string) => `${name}, ваш заказ создан!`,
    headingAnon: "Ваш заказ создан!",
    bodyOrder: (id: string | number) =>
      `Заказ <strong>#${id}</strong> успешно создан.`,
    deliveryCity: (city: string) => ` Доставляем в ${city}.`,
    watchStatus: "Вы можете следить за статусом заказа в личном кабинете.",
    textFallback: (id: string | number) =>
      `Заказ #${id} успешно создан.\n\nМы начинаем сборку и передадим заказ в доставку в ближайшее время.`,
  },
  orderCompleted: {
    preview: (id: string | number) =>
      `Заказ #${id} выполнен — спасибо за покупку!`,
    subject: (id: string | number) =>
      `Заказ #${id} выполнен — ${process.env.STORE_NAME || "Gorgo"}`,
    headingWithName: (name: string) => `${name}, заказ выполнен!`,
    headingAnon: "Заказ выполнен!",
    bodyOrder: (id: string | number) =>
      `Заказ <strong>#${id}</strong> успешно выполнен. Спасибо, что выбрали нас!`,
    deliveryCity: (city: string) => ` Доставлено в ${city}.`,
    bodyPromo:
      "Будем рады видеть вас снова. Посмотрите новые поступления в нашем магазине.",
    textFallback: (id: string | number) =>
      `Заказ #${id} выполнен. Спасибо за покупку!`,
  },
  fulfillment: {
    preview: (id: string | number) => `Заказ #${id} отправлен`,
    subject: (id: string | number) =>
      `Заказ #${id} отправлен — ${process.env.STORE_NAME || "Gorgo"}`,
    headingWithName: (name: string) => `${name}, ваш заказ в пути!`,
    headingAnon: "Ваш заказ в пути!",
    bodyOrder: (id: string | number) =>
      `Заказ <strong>#${id}</strong> передан в службу доставки.`,
    deliveryCity: (city: string) => ` Доставляем в ${city}.`,
    trackingTitle: "Информация об отслеживании",
    trackLabel: "Трек-номер:",
    noTracking:
      "Трек-номер будет добавлен в ваш заказ в личном кабинете после передачи посылки перевозчику.",
    deliveryTime:
      "Обычный срок доставки по России составляет 1–7 рабочих дней в зависимости от вашего региона.",
    textTracking: (numbers: string) => `\nТрек-номер: ${numbers}`,
    textDelivery: "Обычный срок доставки по России — 1–7 рабочих дней.",
    textFallback: (id: string | number) =>
      `Заказ #${id} передан в службу доставки.`,
  },
  payment: {
    preview: (id: string | number) => `Заказ #${id} успешно оплачен`,
    subject: (id: string | number) =>
      `Заказ #${id} оплачен — ${process.env.STORE_NAME || "Gorgo"}`,
    headingWithName: (name: string) => `${name}, ваш заказ оплачен!`,
    headingAnon: "Ваш заказ оплачен!",
    bodyOrder: (id: string | number) =>
      `Заказ <strong>#${id}</strong> успешно оплачен. Мы начинаем его сборку и передадим в доставку в ближайшее время.`,
    watchStatus: "Вы можете следить за статусом заказа в личном кабинете.",
    textFallback: (id: string | number) =>
      `Заказ #${id} успешно оплачен.\n\nМы начинаем сборку и передадим заказ в доставку в ближайшее время.`,
  },
  passwordReset: {
    preview: "Сброс пароля — ссылка действительна 15 минут",
    subject: `Сброс пароля — ${process.env.STORE_NAME || "Gorgo"}`,
    heading: "Сброс пароля",
    body: (email: string) =>
      `Мы получили запрос на сброс пароля для аккаунта <strong>${email}</strong>. Нажмите кнопку ниже, чтобы задать новый пароль.`,
    button: "Сбросить пароль",
    hint: "Ссылка действительна в течение <strong>15 минут</strong>. Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.",
    textFallback: (url: string) =>
      `Сброс пароля\n\nДля сброса пароля перейдите по ссылке (действительна 15 минут):\n${url}\n\nЕсли вы не запрашивали сброс пароля — просто проигнорируйте это письмо.`,
  },
};

const en: typeof ru = {
  layout: {
    copyright: (year: number) => `© ${year} Gorgo. All rights reserved.`,
    contactLine: `${process.env.STORE_ADDRESS || "Moscow, Russia"} · ${process.env.STORE_EMAIL || "demo@gorgojs.com"} · ${process.env.STORE_PHONE || "+7 111 11-11-11"}`,
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
    subject: (id) =>
      `Order #${id} placed — ${process.env.STORE_NAME || "Gorgo"}`,
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
    subject: (id) =>
      `Order #${id} completed — ${process.env.STORE_NAME || "Gorgo"}`,
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
    subject: (id) =>
      `Order #${id} shipped — ${process.env.STORE_NAME || "Gorgo"}`,
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
    subject: (id) => `Order #${id} paid — ${process.env.STORE_NAME || "Gorgo"}`,
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
    subject: `Password reset — ${process.env.STORE_NAME || "Gorgo"}`,
    heading: "Password Reset",
    body: (email) =>
      `We received a request to reset the password for <strong>${email}</strong>. Click the button below to set a new password.`,
    button: "Reset Password",
    hint: "The link is valid for <strong>15 minutes</strong>. If you didn't request a password reset, simply ignore this email.",
    textFallback: (url) =>
      `Password Reset\n\nTo reset your password, follow the link (valid for 15 minutes):\n${url}\n\nIf you didn't request a password reset, simply ignore this email.`,
  },
};

export const emailTranslations: Record<EmailLang, typeof ru> = { ru, en };

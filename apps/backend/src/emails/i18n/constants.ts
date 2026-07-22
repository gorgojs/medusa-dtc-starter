export const EMAIL_LANGS = ["ru", "en", "es", "fr"] as const;

export type EmailLang = (typeof EMAIL_LANGS)[number];

export const STOREFRONT_URL = (
  process.env.STOREFRONT_URL || "https://dtc-starter-demo.gorgojs.com"
).replace(/\/$/, "");

export const STORE_NAME = process.env.STORE_NAME || "Gorgo Medusa Store";

export const STORE_EMAIL = process.env.STORE_EMAIL || "demo@gorgojs.com";

const STORE_ADDRESS_DEFAULTS: Record<EmailLang, string> = {
  en: "New York, USA",
  es: "Madrid, España",
  fr: "Paris, France",
  ru: "Москва, Россия",
};

export function getStoreAddress(lang: EmailLang): string {
  return process.env.STORE_ADDRESS || STORE_ADDRESS_DEFAULTS[lang];
}

const STORE_PHONE_DEFAULTS: Record<EmailLang, string> = {
  en: "+1 111-111-1111",
  es: "+34 111 11 11 11",
  fr: "+33 1 11 11 11 11",
  ru: "+7 111 11-11-11",
};

export function getStorePhone(lang: EmailLang): string {
  return process.env.STORE_PHONE || STORE_PHONE_DEFAULTS[lang];
}

// TODO: determine email language based on country of the order, or default to STOREFRONT_DEFAULT_LOCALE
export function getLang(): EmailLang {
  const envLocale = process.env.STOREFRONT_DEFAULT_LOCALE;
  return EMAIL_LANGS.includes(envLocale as EmailLang)
    ? (envLocale as EmailLang)
    : "en";
}

const INTL_LOCALES: Record<EmailLang, string> = {
  ru: "ru-RU",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export function getIntlLocale(lang: EmailLang): string {
  return INTL_LOCALES[lang];
}

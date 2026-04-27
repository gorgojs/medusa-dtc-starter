import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ru } from "./locales/ru";
import type { EmailLang } from "./constants";
import type { EmailTranslations } from "./types";

export {
  STORE_NAME,
  STOREFRONT_URL,
  STORE_EMAIL,
  getStoreAddress,
  getStorePhone,
  getLang,
  getIntlLocale,
} from "./constants";
export type { EmailLang } from "./constants";
export type { EmailTranslations } from "./types";

export const emailTranslations: Record<EmailLang, EmailTranslations> = {
  ru,
  en,
  es,
  fr,
};

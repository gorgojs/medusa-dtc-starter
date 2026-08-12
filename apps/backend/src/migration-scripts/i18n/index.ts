import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ru } from "./locales/ru";
import type { SeedLocale } from "./constants";
import type { SeedTranslations } from "./types";

export { SEED_LOCALES, SEED_LOCALE_NAMES } from "./constants";
export type { SeedLocale } from "./constants";
export type { SeedTranslations } from "./types";

export const seedTranslations: Record<SeedLocale, SeedTranslations> = {
  ru,
  en,
  fr,
  es,
};

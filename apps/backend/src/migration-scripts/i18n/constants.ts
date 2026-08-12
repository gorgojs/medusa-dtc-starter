export const SEED_LOCALES = ["ru", "en", "fr", "es"] as const;

export type SeedLocale = (typeof SEED_LOCALES)[number];

export const SEED_LOCALE_NAMES: Record<SeedLocale, string> = {
  ru: "Русский",
  en: "English",
  fr: "Français",
  es: "Español",
};

import en from "./json/en.json";
import es from "./json/es.json";
import fr from "./json/fr.json";
import ru from "./json/ru.json";

export type ProductText = { title: string; description: string };
export type LabelText = { label: string; description: string };

export type SeedTranslations = {
  terms: Record<string, string>;
  categories: Record<string, string>;
  products: Record<string, ProductText>;
  collections: Record<string, string>;
  shippingOptions: Record<string, string>;
  shippingTypes: Record<string, LabelText>;
  refundReasons: Record<string, LabelText>;
};

export type SeedLocale = string;

export type SeedLocaleData = {
  code: SeedLocale;
  name: string;
  translations: SeedTranslations;
};

const locales: SeedLocaleData[] = [en, es, fr, ru];

export const SEED_LOCALES: SeedLocale[] = locales.map((locale) => locale.code);

export const SEED_LOCALE_NAMES: Record<SeedLocale, string> = Object.fromEntries(
  locales.map((locale) => [locale.code, locale.name]),
);

export const SEED_TRANSLATIONS: Record<SeedLocale, SeedTranslations> =
  Object.fromEntries(
    locales.map((locale) => [locale.code, locale.translations]),
  );

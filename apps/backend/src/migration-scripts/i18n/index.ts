import fs from "node:fs";
import path from "node:path";
import type { SeedTranslations } from "./types";

export type { SeedTranslations } from "./types";
export type SeedLocale = string;

const localesDir = path.join(__dirname, "locales");

const locales = fs
  .readdirSync(localesDir)
  .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith(".d.ts"))
  .sort()
  .map((file) => {
    const code = path.basename(file, path.extname(file));
    const mod = require(path.join(localesDir, file)) as {
      localeName: string;
      translations: SeedTranslations;
    };
    return { code, name: mod.localeName, translations: mod.translations };
  });

export const SEED_LOCALES: SeedLocale[] = locales.map((locale) => locale.code);

export const SEED_LOCALE_NAMES: Record<SeedLocale, string> = Object.fromEntries(
  locales.map((locale) => [locale.code, locale.name]),
);

export const seedTranslations: Record<SeedLocale, SeedTranslations> =
  Object.fromEntries(
    locales.map((locale) => [locale.code, locale.translations]),
  );

import fs from "node:fs";
import path from "node:path";
import type { SeedRegion } from "./types";

export type { SeedRegion } from "./types";

const countriesDir = path.join(__dirname, "countries");

export const SEED_REGIONS: SeedRegion[] = fs
  .readdirSync(countriesDir)
  .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith(".d.ts"))
  .sort()
  .map((file) => {
    const mod = require(path.join(countriesDir, file)) as {
      region: SeedRegion;
    };
    return mod.region;
  });

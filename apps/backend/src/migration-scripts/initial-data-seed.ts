import type { MedusaContainer } from "@medusajs/framework";
import {
  isAlreadySeeded,
  seedCategories,
  seedCollections,
  seedFulfillment,
  seedInventoryLevels,
  seedProductOptionMetadata,
  seedProductOptions,
  seedProducts,
  seedRegions,
  seedStockLocations,
  seedStore,
  seedTaxRegions,
  seedTranslations,
} from "./lib";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  if (await isAlreadySeeded(container)) return;

  await seedStore(container);
  await seedRegions(container);
  await seedTaxRegions(container);
  await seedStockLocations(container);
  await seedFulfillment(container);
  await seedCategories(container);
  await seedProductOptions(container);
  await seedProducts(container);
  await seedProductOptionMetadata(container);
  await seedCollections(container);
  await seedTranslations(container);
  await seedInventoryLevels(container);
}

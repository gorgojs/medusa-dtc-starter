import type { MedusaContainer } from "@medusajs/framework";
import type { CreateTranslationDTO } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  batchLinkProductsToCollectionWorkflow,
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  createTranslationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  SEED_LOCALES,
  SEED_LOCALE_NAMES,
  seedTranslations,
  type SeedLocale,
  type SeedTranslations,
} from "./i18n";
import { SEED_REGIONS } from "./regions";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  );

  const { data: existingSalesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    filters: { name: "Default Sales Channel" },
  });
  if (existingSalesChannels.length > 0) {
    logger.info("Store already seeded — skipping initial data seed.");
    return;
  }

  const currencyCodes = Array.from(
    new Set(SEED_REGIONS.map((seedRegion) => seedRegion.currency_code)),
  );

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "My Store",
          supported_currencies: currencyCodes.map((currency_code) => ({
            currency_code,
            is_default: currency_code === "rub",
          })),
          supported_locales: SEED_LOCALES.map((locale_code) => ({
            locale_code,
          })),
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  await createRegionsWorkflow(container).run({
    input: {
      regions: SEED_REGIONS.map((seedRegion) => ({
        name: seedRegion.name,
        currency_code: seedRegion.currency_code,
        countries: [seedRegion.country_code],
        payment_providers: ["pp_system_default"],
      })),
    },
  });
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: SEED_REGIONS.map((seedRegion) => ({
      country_code: seedRegion.country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "Main Warehouse",
          address: {
            city: "Moscow",
            country_code: "RU",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Warehouse shipping",
    type: "shipping",
    service_zones: [
      {
        name: "International",
        geo_zones: SEED_REGIONS.map((seedRegion) => ({
          country_code: seedRegion.country_code,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  const courierPriceByCurrency: Record<string, number> = {
    rub: 499,
    usd: 6,
    eur: 5,
    cny: 43,
    mxn: 108,
  };

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Courier delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Courier",
          description: "Delivery within 2–3 days.",
          code: "courier",
        },
        // @ts-expect-error metadata is untyped on the workflow input but works at runtime
        metadata: {
          delivery_days_min: 2,
          delivery_days_max: 3,
        },
        prices: currencyCodes.map((currency_code) => ({
          currency_code,
          amount: courierPriceByCurrency[currency_code],
        })),
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Pickup",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Pickup",
          description: "Pick up at a pickup point.",
          code: "pickup",
        },
        // @ts-expect-error metadata is untyped on the workflow input but works at runtime
        metadata: {
          delivery_days_min: 0,
          delivery_days_max: 0,
        },
        prices: currencyCodes.map((currency_code) => ({
          currency_code,
          amount: 0,
        })),
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const { result: parentCategories } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: "Clothing",
          handle: "clothing",
          is_active: true,
        },
        {
          name: "Electronics",
          handle: "electronics",
          is_active: true,
        },
        {
          name: "Home",
          handle: "home",
          is_active: true,
        },
      ],
    },
  });

  const parentCategoryId = (name: string) =>
    parentCategories.find((category) => category.name === name)!.id;

  const { result: childCategories } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: "T-Shirts",
          handle: "shirts",
          is_active: true,
          parent_category_id: parentCategoryId("Clothing"),
        },
        {
          name: "Sweatshirts",
          handle: "sweatshirts",
          is_active: true,
          parent_category_id: parentCategoryId("Clothing"),
        },
        {
          name: "Pants",
          handle: "pants",
          is_active: true,
          parent_category_id: parentCategoryId("Clothing"),
        },
        {
          name: "Outerwear",
          handle: "outerwear",
          is_active: true,
          parent_category_id: parentCategoryId("Clothing"),
        },
        {
          name: "Shorts",
          handle: "shorts",
          is_active: true,
          parent_category_id: parentCategoryId("Clothing"),
        },
        {
          name: "Headphones",
          handle: "headphones",
          is_active: true,
          parent_category_id: parentCategoryId("Electronics"),
        },
        {
          name: "Electric Transport",
          handle: "e-transport",
          is_active: true,
          parent_category_id: parentCategoryId("Electronics"),
        },
        {
          name: "Tableware",
          handle: "tableware",
          is_active: true,
          parent_category_id: parentCategoryId("Home"),
        },
        {
          name: "Coffee",
          handle: "coffee",
          is_active: true,
          parent_category_id: parentCategoryId("Home"),
        },
      ],
    },
  });

  const categoryResult = childCategories;

  const { result: productOptionsResult } = await createProductOptionsWorkflow(
    container,
  ).run({
    input: {
      product_options: [
        {
          title: "Size",
          values: ["S", "M", "L", "XL"],
        },
        {
          title: "Color",
          values: ["Black", "White", "Silver"],
        },
      ],
    },
  });
  const sizeOption = productOptionsResult.find((o) => o.title === "Size")!;
  const colorOption = productOptionsResult.find((o) => o.title === "Color")!;

  const { result: productsResult } = await createProductsWorkflow(
    container,
  ).run({
    input: {
      products: [
        {
          title: "Medusa T-Shirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "T-Shirts")!.id,
          ],
          description:
            "Reimagine the feel of a classic tee. With our cotton T-shirts, everyday essentials are no longer ordinary.",
          handle: "t-shirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
            },
          ],
          options: [{ id: sizeOption.id }, { id: colorOption.id }],
          variants: [
            {
              title: "S / Black",
              sku: "SHIRT-S-BLACK",
              options: {
                Size: "S",
                Color: "Black",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "S / White",
              sku: "SHIRT-S-WHITE",
              options: {
                Size: "S",
                Color: "White",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "M / Black",
              sku: "SHIRT-M-BLACK",
              options: {
                Size: "M",
                Color: "Black",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "M / White",
              sku: "SHIRT-M-WHITE",
              options: {
                Size: "M",
                Color: "White",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "L / Black",
              sku: "SHIRT-L-BLACK",
              options: {
                Size: "L",
                Color: "Black",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "L / White",
              sku: "SHIRT-L-WHITE",
              options: {
                Size: "L",
                Color: "White",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "XL / Black",
              sku: "SHIRT-XL-BLACK",
              options: {
                Size: "XL",
                Color: "Black",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
            {
              title: "XL / White",
              sku: "SHIRT-XL-WHITE",
              options: {
                Size: "XL",
                Color: "White",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Medusa Sweatshirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Sweatshirts")!.id,
          ],
          description:
            "Reimagine the feel of a classic sweatshirt. With our cotton sweatshirt, everyday essentials are no longer ordinary.",
          handle: "sweatshirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
            },
          ],
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "S",
              sku: "SWEATSHIRT-S",
              options: { Size: "S" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
                { amount: 209, currency_code: "cny" },
                { amount: 522, currency_code: "mxn" },
              ],
            },
            {
              title: "M",
              sku: "SWEATSHIRT-M",
              options: { Size: "M" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
                { amount: 209, currency_code: "cny" },
                { amount: 522, currency_code: "mxn" },
              ],
            },
            {
              title: "L",
              sku: "SWEATSHIRT-L",
              options: { Size: "L" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
                { amount: 209, currency_code: "cny" },
                { amount: 522, currency_code: "mxn" },
              ],
            },
            {
              title: "XL",
              sku: "SWEATSHIRT-XL",
              options: { Size: "XL" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
                { amount: 209, currency_code: "cny" },
                { amount: 522, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Medusa Sweatpants",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Pants")!.id,
          ],
          description:
            "Reimagine the feel of classic sweatpants. With our cotton sweatpants, everyday essentials are no longer ordinary.",
          handle: "sweatpants",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
            },
          ],
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "S",
              sku: "SWEATPANTS-S",
              options: { Size: "S" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
                { amount: 173, currency_code: "cny" },
                { amount: 432, currency_code: "mxn" },
              ],
            },
            {
              title: "M",
              sku: "SWEATPANTS-M",
              options: { Size: "M" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
                { amount: 173, currency_code: "cny" },
                { amount: 432, currency_code: "mxn" },
              ],
            },
            {
              title: "L",
              sku: "SWEATPANTS-L",
              options: { Size: "L" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
                { amount: 173, currency_code: "cny" },
                { amount: 432, currency_code: "mxn" },
              ],
            },
            {
              title: "XL",
              sku: "SWEATPANTS-XL",
              options: { Size: "XL" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
                { amount: 173, currency_code: "cny" },
                { amount: 432, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Medusa Shorts",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Shorts")!.id,
          ],
          description:
            "Reimagine the feel of classic shorts. With our cotton shorts, everyday essentials are no longer ordinary.",
          handle: "shorts",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
            },
          ],
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "S",
              sku: "SHORTS-S",
              options: { Size: "S" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
                { amount: 137, currency_code: "cny" },
                { amount: 342, currency_code: "mxn" },
              ],
            },
            {
              title: "M",
              sku: "SHORTS-M",
              options: { Size: "M" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
                { amount: 137, currency_code: "cny" },
                { amount: 342, currency_code: "mxn" },
              ],
            },
            {
              title: "L",
              sku: "SHORTS-L",
              options: { Size: "L" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
                { amount: 137, currency_code: "cny" },
                { amount: 342, currency_code: "mxn" },
              ],
            },
            {
              title: "XL",
              sku: "SHORTS-XL",
              options: { Size: "XL" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
                { amount: 137, currency_code: "cny" },
                { amount: 342, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Hoodie",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Sweatshirts")!.id,
          ],
          description:
            "Classic black hoodie made from soft cotton fabric for everyday comfort. Features a relaxed fit, adjustable drawstring hood and front kangaroo pocket. Simple and versatile for layering in any season.",
          handle: "hoodie",
          weight: 600,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Sweatshirt%201-01KBNDBVW0ATNSHA3FPPEE9R13.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Sweatshirt%202-2-01KBNDBVW3XR32EEB9YBR673AF.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Sweatshirt%203-01KBNDBVW4XPMWCCSNTY5EV83P.png",
            },
          ],
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "S",
              sku: "HOODIE-S",
              options: { Size: "S" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
                { amount: 252, currency_code: "cny" },
                { amount: 630, currency_code: "mxn" },
              ],
            },
            {
              title: "M",
              sku: "HOODIE-M",
              options: { Size: "M" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
                { amount: 252, currency_code: "cny" },
                { amount: 630, currency_code: "mxn" },
              ],
            },
            {
              title: "L",
              sku: "HOODIE-L",
              options: { Size: "L" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
                { amount: 252, currency_code: "cny" },
                { amount: 630, currency_code: "mxn" },
              ],
            },
            {
              title: "XL",
              sku: "HOODIE-XL",
              options: { Size: "XL" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
                { amount: 252, currency_code: "cny" },
                { amount: 630, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Chino Pants",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Pants")!.id,
          ],
          description:
            "Classic black chino pants with a tailored fit and minimal design. Made from soft, durable cotton fabric with a hint of stretch for comfort. Features side pockets, belt loops and a button closure. Ideal for both casual and smart wear.",
          handle: "chino-pants",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Chino%20pants%201-01K9Q93MCFNPMQ35V1RTGXCN0X.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Chino%20pants%202-01K9Q93MCG9EXWSXC6P1Q6C76G.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Chino%20pants%203-01K9Q93MCH6PS4HW7VBV6CSTA7.png",
            },
          ],
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "S",
              sku: "CHINO-S",
              options: { Size: "S" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
                { amount: 238, currency_code: "cny" },
                { amount: 594, currency_code: "mxn" },
              ],
            },
            {
              title: "M",
              sku: "CHINO-M",
              options: { Size: "M" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
                { amount: 238, currency_code: "cny" },
                { amount: 594, currency_code: "mxn" },
              ],
            },
            {
              title: "L",
              sku: "CHINO-L",
              options: { Size: "L" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
                { amount: 238, currency_code: "cny" },
                { amount: 594, currency_code: "mxn" },
              ],
            },
            {
              title: "XL",
              sku: "CHINO-XL",
              options: { Size: "XL" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
                { amount: 238, currency_code: "cny" },
                { amount: 594, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Puffer Jacket",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Outerwear")!.id,
          ],
          description:
            "Insulated black puffer jacket designed for warmth and comfort in cold weather. Features a high collar, front zipper with snap closure, and multiple pockets for functionality. Lightweight yet durable for everyday wear or outdoor use.",
          handle: "puffer-jacket",
          weight: 1200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Winter%20jacket%209-01K9Q8E20B4Z8W84RPD5BF59HZ.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Winter%20jacket%2011-01K9Q8E20E04BD8GPVW0P3P6FM.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Winter%20jacket%2010-01K9Q8E20GGG6NX49D6RT8DMV6.png",
            },
          ],
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "S",
              sku: "PUFFER-S",
              options: { Size: "S" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
                { amount: 504, currency_code: "cny" },
                { amount: 1260, currency_code: "mxn" },
              ],
            },
            {
              title: "M",
              sku: "PUFFER-M",
              options: { Size: "M" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
                { amount: 504, currency_code: "cny" },
                { amount: 1260, currency_code: "mxn" },
              ],
            },
            {
              title: "L",
              sku: "PUFFER-L",
              options: { Size: "L" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
                { amount: 504, currency_code: "cny" },
                { amount: 1260, currency_code: "mxn" },
              ],
            },
            {
              title: "XL",
              sku: "PUFFER-XL",
              options: { Size: "XL" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
                { amount: 504, currency_code: "cny" },
                { amount: 1260, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Wireless Over-Ear Headphones",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Headphones")!.id,
          ],
          description:
            "Matte black wireless headphones with a comfortable over-ear design for immersive listening. Provide clear sound, strong bass and long battery life. Built for everyday use at home, in the office or on the go.",
          handle: "wireless-headphones",
          weight: 300,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Headphones%201-01K9Q3FB7AZWJQDCV0AZH1HE6R.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Headphones%202-01K9Q3FB7BTQ43JYE1EEZPBWZF.png",
            },
          ],
          options: [{ id: colorOption.id }],
          variants: [
            {
              title: "Black",
              sku: "HEADPHONES",
              options: { Color: "Black" },
              prices: [
                { amount: 7999, currency_code: "rub" },
                { amount: 86, currency_code: "eur" },
                { amount: 94, currency_code: "usd" },
                { amount: 677, currency_code: "cny" },
                { amount: 1692, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Electric Bike",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Electric Transport")!.id,
          ],
          description:
            "Matte black electric mountain bike built for performance and everyday versatility. Features a lightweight aluminum frame, integrated battery, and powerful motor for smooth assisted riding on all terrains. Designed for both city commutes and off-road trails.",
          handle: "electric-bike",
          weight: 20000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Bike%201-01K9Q4C289JCSVNVZHXK90E3S3.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Bike%202-01K9Q4C28AY723T73QQ0F2ERAF.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Bike%203-01K9Q4C28CFPV312AEEF9TRBQW.png",
            },
          ],
          options: [{ id: colorOption.id }],
          variants: [
            {
              title: "Black",
              sku: "BIKE",
              options: { Color: "Black" },
              prices: [
                { amount: 89999, currency_code: "rub" },
                { amount: 970, currency_code: "eur" },
                { amount: 1050, currency_code: "usd" },
                { amount: 7560, currency_code: "cny" },
                { amount: 18900, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Serving Plate",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Tableware")!.id,
          ],
          description:
            "A sculptural stainless steel serving plate with a polished mirror finish. Its fluid, modern shape adds a refined touch to any table setting. Perfect for fruit, appetizers or decorative display. Designed for both functionality and visual impact, it reflects light beautifully and complements any contemporary home or restaurant style.",
          handle: "serving-plate",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Plate%201-01K9Q2JX9A6ZTY7FM3VB1CJHNT.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Plate%203-01K9Q2JX9D07HAQXPR2S0W3Y63.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Plate%202-01K9Q2JX9E8VWYZ4ZBCD12QYHE.png",
            },
          ],
          options: [{ id: colorOption.id }],
          variants: [
            {
              title: "Silver",
              sku: "PLATE",
              options: { Color: "Silver" },
              prices: [
                { amount: 3499, currency_code: "rub" },
                { amount: 38, currency_code: "eur" },
                { amount: 41, currency_code: "usd" },
                { amount: 295, currency_code: "cny" },
                { amount: 738, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Espresso Cup",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Coffee")!.id,
          ],
          description:
            "Black ceramic espresso cups designed for single or double shots. Durable, heat retaining and dishwasher safe.",
          handle: "espresso-cup",
          weight: 200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Espresso%20cup%201-01K9C972AVS9YMJ3AWBTNMYVKP.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Espresso%20cup%202-01K9C972AYF51YNCD6FYVR5CCQ.png",
            },
            {
              url: "https://s3.eu-central-1.amazonaws.com/medusajs.cloud-data-prod-euc1-20241127132538579500000002/ef47368a1f5430f9c1b/Espresso%20cup%203-01K9C972B0KTJG2M56S2G0YVWX.png",
            },
          ],
          options: [{ id: colorOption.id }],
          variants: [
            {
              title: "Black",
              sku: "ESPRESSO-CUP",
              options: { Color: "Black" },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
                { amount: 108, currency_code: "cny" },
                { amount: 270, currency_code: "mxn" },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding color option value metadata...");
  const productModuleService = container.resolve(Modules.PRODUCT);
  const colorHexByValue: Record<string, string> = {
    Black: "#111111",
    White: "#ffffff",
    Silver: "#c0c0c0",
  };
  const allColorOptionValues =
    await productModuleService.listProductOptionValues({});
  await Promise.all(
    allColorOptionValues
      .filter((value) => colorHexByValue[value.value])
      .map((value) =>
        productModuleService.updateProductOptionValues(value.id, {
          metadata: {
            ...(value.metadata ?? {}),
            hex: colorHexByValue[value.value],
          },
        }),
      ),
  );
  logger.info("Finished seeding color option value metadata.");

  logger.info("Seeding product collection...");

  const { result: collectionsResult } = await createCollectionsWorkflow(
    container,
  ).run({
    input: {
      collections: [
        {
          title: "New Arrivals",
          handle: "new",
        },
      ],
    },
  });

  const collection = collectionsResult[0];

  await batchLinkProductsToCollectionWorkflow(container).run({
    input: {
      id: collection.id,
      add: productsResult.slice(0, 4).map((p) => p.id),
    },
  });

  logger.info("Finished seeding product collection.");

  logger.info("Seeding translations...");

  const translationModuleService = container.resolve(Modules.TRANSLATION);

  await translationModuleService.createLocales(
    SEED_LOCALES.map((code) => ({ code, name: SEED_LOCALE_NAMES[code] })),
  );

  const translations: CreateTranslationDTO[] = [];
  const clean = (fields: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(fields).filter(
        ([, value]) => value != null && value !== "",
      ),
    );
  const addTranslations = (
    reference: string,
    referenceId: string,
    byLocale: Partial<Record<SeedLocale, Record<string, unknown>>>,
  ) => {
    for (const locale of SEED_LOCALES) {
      const fields = byLocale[locale];
      if (!fields) continue;
      const cleaned = clean(fields);
      if (Object.keys(cleaned).length) {
        translations.push({
          reference,
          reference_id: referenceId,
          locale_code: locale,
          translations: cleaned,
        });
      }
    }
  };

  const translationsFor = <T>(
    getFields: (t: SeedTranslations) => T,
  ): Partial<Record<SeedLocale, T>> =>
    Object.fromEntries(
      SEED_LOCALES.map((locale) => [
        locale,
        getFields(seedTranslations[locale]),
      ]),
    );

  const translateTerm = (value: string, t: SeedTranslations) =>
    t.terms[value] ?? value;

  for (const category of [...parentCategories, ...childCategories]) {
    addTranslations(
      "product_category",
      category.id,
      translationsFor((t) => ({ name: t.categories[category.handle] })),
    );
  }

  for (const productCollection of collectionsResult) {
    addTranslations(
      "product_collection",
      productCollection.id,
      translationsFor((t) => ({
        title: t.collections[productCollection.handle],
      })),
    );
  }

  const { data: seededProductOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values.id", "values.value"],
  });

  for (const option of seededProductOptions) {
    addTranslations(
      "product_option",
      option.id,
      translationsFor((t) => ({ title: translateTerm(option.title, t) })),
    );

    for (const optionValue of option.values ?? []) {
      addTranslations(
        "product_option_value",
        optionValue.id,
        translationsFor((t) => ({
          value: translateTerm(optionValue.value, t),
        })),
      );
    }
  }

  const { data: seededProducts } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "description",
      "variants.id",
      "variants.title",
    ],
    filters: {
      id: productsResult.map((product) => product.id),
    },
  });

  for (const product of seededProducts) {
    addTranslations(
      "product",
      product.id,
      translationsFor((t) => t.products[product.handle]),
    );

    for (const variant of product.variants ?? []) {
      const localizeTitle = (t: SeedTranslations) =>
        variant.title
          .split(" / ")
          .map((segment: string) => translateTerm(segment, t))
          .join(" / ");
      addTranslations(
        "product_variant",
        variant.id,
        translationsFor((t) => ({ title: localizeTitle(t) })),
      );
    }
  }

  const { data: seededShippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "type.id",
      "type.code",
      "type.label",
      "type.description",
    ],
  });

  for (const shippingOption of seededShippingOptions) {
    const optionType = shippingOption.type;
    if (!optionType) continue;

    addTranslations(
      "shipping_option",
      shippingOption.id,
      translationsFor((t) => ({ name: t.shippingOptions[optionType.code] })),
    );

    addTranslations(
      "shipping_option_type",
      optionType.id,
      translationsFor((t) => t.shippingTypes[optionType.code]),
    );
  }

  const { data: seededRefundReasons } = await query.graph({
    entity: "refund_reason",
    fields: ["id", "label", "description"],
  });

  for (const refundReason of seededRefundReasons) {
    addTranslations(
      "refund_reason",
      refundReason.id,
      translationsFor((t) => t.refundReasons[refundReason.label]),
    );
  }

  await createTranslationsWorkflow(container).run({
    input: { translations },
  });

  logger.info(`Finished seeding ${translations.length} translations.`);

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}

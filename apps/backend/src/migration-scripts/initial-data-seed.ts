import type { MedusaContainer } from "@medusajs/framework";
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
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

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
    filters: { name: "Основной канал продаж" },
  });
  if (existingSalesChannels.length > 0) {
    logger.info("Store already seeded — skipping initial data seed.");
    return;
  }

  const countries = ["az", "am", "by", "kz", "kg", "ru", "tj", "tm", "uz"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Основной канал продаж",
          description: "Создан Medusa",
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
          name: "Основной магазин",
          supported_currencies: [
            {
              currency_code: "rub",
              is_default: true,
            },
            {
              currency_code: "eur",
              is_default: false,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "СНГ",
          currency_code: "rub",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
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
          name: "Склад СНГ",
          address: {
            city: "Москва",
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
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Доставка склада СНГ",
    type: "shipping",
    service_zones: [
      {
        name: "СНГ",
        geo_zones: [
          { country_code: "az", type: "country" },
          { country_code: "am", type: "country" },
          { country_code: "by", type: "country" },
          { country_code: "kz", type: "country" },
          { country_code: "kg", type: "country" },
          { country_code: "ru", type: "country" },
          { country_code: "tj", type: "country" },
          { country_code: "tm", type: "country" },
          { country_code: "uz", type: "country" },
        ],
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

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Доставка курьером",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Курьер",
          description: "Доставка в течение 2-3 дней.",
          code: "courier",
        },
        prices: [
          {
            currency_code: "rub",
            amount: 499,
          },
          {
            currency_code: "usd",
            amount: 6,
          },
          {
            currency_code: "eur",
            amount: 5,
          },
          {
            region_id: region.id,
            amount: 499,
          },
        ],
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
        name: "Самовывоз",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Самовывоз",
          description: "Забрать в пункте выдачи.",
          code: "pickup",
        },
        prices: [
          {
            currency_code: "rub",
            amount: 0,
          },
          {
            currency_code: "usd",
            amount: 0,
          },
          {
            currency_code: "eur",
            amount: 0,
          },
          {
            region_id: region.id,
            amount: 0,
          },
        ],
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

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: "Футболки",
          handle: "shirts",
          is_active: true,
          metadata: {
            seo_title: "Футболки — купить онлайн",
            seo_description:
              "Широкий выбор качественных хлопковых футболок. Доставка по всем странам СНГ.",
          },
        },
        {
          name: "Толстовки",
          handle: "sweatshirts",
          is_active: true,
          metadata: {
            seo_title: "Толстовки — купить онлайн",
            seo_description:
              "Стильные и удобные толстовки из натурального хлопка. Доставка по всем странам СНГ.",
          },
        },
        {
          name: "Брюки",
          handle: "pants",
          is_active: true,
          metadata: {
            seo_title: "Спортивные штаны — купить онлайн",
            seo_description:
              "Удобные спортивные штаны для повседневной жизни. Доставка по всем странам СНГ.",
          },
        },
        {
          name: "Мерч",
          handle: "merch",
          is_active: true,
          metadata: {
            seo_title: "Мерч — купить онлайн",
            seo_description:
              "Официальный мерч: шорты и другие аксессуары. Доставка по всем странам СНГ.",
          },
        },
      ],
    },
  });

  const { result: productsResult } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Футболка Medusa",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Футболки")!.id,
          ],
          description:
            "Переосмыслите ощущение классической футболки. С нашими хлопковыми футболками повседневные вещи больше не будут обычными.",
          handle: "t-shirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Футболка Medusa — купить онлайн",
            seo_description:
              "Классическая хлопковая футболка Medusa в чёрном и белом цвете. Размеры S–XL. Доставка по всем странам СНГ.",
          },
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
          options: [
            {
              title: "Размер",
              values: ["S", "M", "L", "XL"],
            },
            {
              title: "Цвет",
              values: ["Чёрный", "Белый"],
            },
          ],
          variants: [
            {
              title: "S / Чёрный",
              sku: "SHIRT-S-BLACK",
              options: {
                Размер: "S",
                Цвет: "Чёрный",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "S / Белый",
              sku: "SHIRT-S-WHITE",
              options: {
                Размер: "S",
                Цвет: "Белый",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "M / Чёрный",
              sku: "SHIRT-M-BLACK",
              options: {
                Размер: "M",
                Цвет: "Чёрный",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "M / Белый",
              sku: "SHIRT-M-WHITE",
              options: {
                Размер: "M",
                Цвет: "Белый",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "L / Чёрный",
              sku: "SHIRT-L-BLACK",
              options: {
                Размер: "L",
                Цвет: "Чёрный",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "L / Белый",
              sku: "SHIRT-L-WHITE",
              options: {
                Размер: "L",
                Цвет: "Белый",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "XL / Чёрный",
              sku: "SHIRT-XL-BLACK",
              options: {
                Размер: "XL",
                Цвет: "Чёрный",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
              ],
            },
            {
              title: "XL / Белый",
              sku: "SHIRT-XL-WHITE",
              options: {
                Размер: "XL",
                Цвет: "Белый",
              },
              prices: [
                { amount: 1299, currency_code: "rub" },
                { amount: 14, currency_code: "eur" },
                { amount: 15, currency_code: "usd" },
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
          title: "Толстовка Medusa",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Толстовки")!.id,
          ],
          description:
            "Переосмыслите ощущение классической толстовки. С нашей хлопковой толстовкой повседневные вещи больше не будут обычными.",
          handle: "sweatshirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Толстовка Medusa — купить онлайн",
            seo_description:
              "Классическая хлопковая толстовка Medusa. Размеры S–XL. Доставка по всем странам СНГ.",
          },
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
            },
          ],
          options: [
            {
              title: "Размер",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATSHIRT-S",
              options: { Размер: "S" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
              ],
            },
            {
              title: "M",
              sku: "SWEATSHIRT-M",
              options: { Размер: "M" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
              ],
            },
            {
              title: "L",
              sku: "SWEATSHIRT-L",
              options: { Размер: "L" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
              ],
            },
            {
              title: "XL",
              sku: "SWEATSHIRT-XL",
              options: { Размер: "XL" },
              prices: [
                { amount: 2499, currency_code: "rub" },
                { amount: 27, currency_code: "eur" },
                { amount: 29, currency_code: "usd" },
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
          title: "Спортивные штаны Medusa",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Брюки")!.id,
          ],
          description:
            "Переосмыслите ощущение классических спортивных штанов. С нашими хлопковыми спортивными штанами повседневные вещи больше не будут обычными.",
          handle: "sweatpants",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Спортивные штаны Medusa — купить онлайн",
            seo_description:
              "Удобные хлопковые спортивные штаны Medusa. Размеры S–XL. Доставка по всем странам СНГ.",
          },
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
            },
          ],
          options: [
            {
              title: "Размер",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATPANTS-S",
              options: { Размер: "S" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
              ],
            },
            {
              title: "M",
              sku: "SWEATPANTS-M",
              options: { Размер: "M" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
              ],
            },
            {
              title: "L",
              sku: "SWEATPANTS-L",
              options: { Размер: "L" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
              ],
            },
            {
              title: "XL",
              sku: "SWEATPANTS-XL",
              options: { Размер: "XL" },
              prices: [
                { amount: 1999, currency_code: "rub" },
                { amount: 22, currency_code: "eur" },
                { amount: 24, currency_code: "usd" },
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
          title: "Шорты Medusa",
          category_ids: [categoryResult.find((cat) => cat.name === "Мерч")!.id],
          description:
            "Переосмыслите ощущение классических шорт. С нашими хлопковыми шортами повседневные вещи больше не будут обычными.",
          handle: "shorts",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Шорты Medusa — купить онлайн",
            seo_description:
              "Стильные хлопковые шорты Medusa. Размеры S–XL. Доставка по всем странам СНГ.",
          },
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
            },
          ],
          options: [
            {
              title: "Размер",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SHORTS-S",
              options: { Размер: "S" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
              ],
            },
            {
              title: "M",
              sku: "SHORTS-M",
              options: { Размер: "M" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
              ],
            },
            {
              title: "L",
              sku: "SHORTS-L",
              options: { Размер: "L" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
              ],
            },
            {
              title: "XL",
              sku: "SHORTS-XL",
              options: { Размер: "XL" },
              prices: [
                { amount: 1599, currency_code: "rub" },
                { amount: 17, currency_code: "eur" },
                { amount: 19, currency_code: "usd" },
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

  logger.info("Seeding product collection...");

  const { result: collectionsResult } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        {
          title: "Все товары",
          handle: "all",
        },
      ],
    },
  });

  const collection = collectionsResult[0];

  await batchLinkProductsToCollectionWorkflow(container).run({
    input: {
      id: collection.id,
      add: productsResult.map((p) => p.id),
    },
  });

  logger.info("Finished seeding product collection.");

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

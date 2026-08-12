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
} from "./i18n";

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

  const countries = ["az", "am", "by", "kz", "kg", "ru", "tj", "tm", "uz"];

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
          supported_locales: [
            { locale_code: "en" },
            { locale_code: "es" },
            { locale_code: "fr" },
            { locale_code: "ru" },
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
          name: "ЕАЭС",
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
          name: "Основной склад",
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
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Доставка со основного склада",
    type: "shipping",
    service_zones: [
      {
        name: "ЕАЭС",
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
        // @ts-expect-error metadata is untyped on the workflow input but works at runtime
        metadata: {
          delivery_days_min: 2,
          delivery_days_max: 3,
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
        // @ts-expect-error metadata is untyped on the workflow input but works at runtime
        metadata: {
          delivery_days_min: 0,
          delivery_days_max: 0,
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

  const { result: parentCategories } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: "Одежда",
          handle: "clothing",
          is_active: true,
          metadata: {
            seo_title: "Одежда — купить онлайн",
            seo_description:
              "Одежда на каждый день: футболки, толстовки, брюки и верхняя одежда. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Электроника",
          handle: "electronics",
          is_active: true,
          metadata: {
            seo_title: "Электроника — купить онлайн",
            seo_description:
              "Наушники, электротранспорт и другая техника. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Дом",
          handle: "home",
          is_active: true,
          metadata: {
            seo_title: "Товары для дома — купить онлайн",
            seo_description:
              "Посуда и аксессуары для дома и кухни. Доставка по всем странам ЕАЭС.",
          },
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
          name: "Футболки",
          handle: "shirts",
          is_active: true,
          parent_category_id: parentCategoryId("Одежда"),
          metadata: {
            seo_title: "Футболки — купить онлайн",
            seo_description:
              "Широкий выбор качественных хлопковых футболок. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Толстовки",
          handle: "sweatshirts",
          is_active: true,
          parent_category_id: parentCategoryId("Одежда"),
          metadata: {
            seo_title: "Толстовки — купить онлайн",
            seo_description:
              "Стильные и удобные толстовки и худи из натурального хлопка. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Брюки",
          handle: "pants",
          is_active: true,
          parent_category_id: parentCategoryId("Одежда"),
          metadata: {
            seo_title: "Брюки — купить онлайн",
            seo_description:
              "Спортивные штаны, чиносы и другие брюки для повседневной жизни. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Верхняя одежда",
          handle: "outerwear",
          is_active: true,
          parent_category_id: parentCategoryId("Одежда"),
          metadata: {
            seo_title: "Верхняя одежда — купить онлайн",
            seo_description:
              "Пуховики и куртки для холодной погоды. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Шорты",
          handle: "shorts",
          is_active: true,
          parent_category_id: parentCategoryId("Одежда"),
          metadata: {
            seo_title: "Шорты — купить онлайн",
            seo_description:
              "Стильные хлопковые шорты на лето. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Наушники",
          handle: "headphones",
          is_active: true,
          parent_category_id: parentCategoryId("Электроника"),
          metadata: {
            seo_title: "Наушники — купить онлайн",
            seo_description:
              "Беспроводные наушники для музыки и звонков. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Электротранспорт",
          handle: "e-transport",
          is_active: true,
          parent_category_id: parentCategoryId("Электроника"),
          metadata: {
            seo_title: "Электротранспорт — купить онлайн",
            seo_description:
              "Электровелосипеды и другой электротранспорт. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Посуда",
          handle: "tableware",
          is_active: true,
          parent_category_id: parentCategoryId("Дом"),
          metadata: {
            seo_title: "Посуда — купить онлайн",
            seo_description:
              "Сервировочная посуда из нержавеющей стали и керамики. Доставка по всем странам ЕАЭС.",
          },
        },
        {
          name: "Кофе",
          handle: "coffee",
          is_active: true,
          parent_category_id: parentCategoryId("Дом"),
          metadata: {
            seo_title: "Кофе — купить онлайн",
            seo_description:
              "Чашки для эспрессо и аксессуары для кофе. Доставка по всем странам ЕАЭС.",
          },
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
          title: "Размер",
          values: ["S", "M", "L", "XL"],
        },
        {
          title: "Цвет",
          values: ["Чёрный", "Белый", "Серебристый"],
        },
      ],
    },
  });
  const sizeOption = productOptionsResult.find((o) => o.title === "Размер")!;
  const colorOption = productOptionsResult.find((o) => o.title === "Цвет")!;

  const { result: productsResult } = await createProductsWorkflow(
    container,
  ).run({
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
              "Классическая хлопковая футболка Medusa в чёрном и белом цвете. Размеры S–XL. Доставка по всем странам ЕАЭС.",
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
          options: [{ id: sizeOption.id }, { id: colorOption.id }],
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
              "Классическая хлопковая толстовка Medusa. Размеры S–XL. Доставка по всем странам ЕАЭС.",
          },
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
              "Удобные хлопковые спортивные штаны Medusa. Размеры S–XL. Доставка по всем странам ЕАЭС.",
          },
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
          category_ids: [
            categoryResult.find((cat) => cat.name === "Шорты")!.id,
          ],
          description:
            "Переосмыслите ощущение классических шорт. С нашими хлопковыми шортами повседневные вещи больше не будут обычными.",
          handle: "shorts",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Шорты Medusa — купить онлайн",
            seo_description:
              "Стильные хлопковые шорты Medusa. Размеры S–XL. Доставка по всем странам ЕАЭС.",
          },
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
        {
          title: "Худи",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Толстовки")!.id,
          ],
          description:
            "Классическое чёрное худи из мягкого хлопка для повседневного комфорта. Свободный крой, капюшон с регулирующимися завязками и передний карман-кенгуру. Простое и универсальное — для многослойных образов в любой сезон.",
          handle: "hoodie",
          weight: 600,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Худи — купить онлайн",
            seo_description:
              "Классическое чёрное худи из мягкого хлопка. Размеры S–XL. Доставка по всем странам ЕАЭС.",
          },
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
              options: { Размер: "S" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
              ],
            },
            {
              title: "M",
              sku: "HOODIE-M",
              options: { Размер: "M" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
              ],
            },
            {
              title: "L",
              sku: "HOODIE-L",
              options: { Размер: "L" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
              ],
            },
            {
              title: "XL",
              sku: "HOODIE-XL",
              options: { Размер: "XL" },
              prices: [
                { amount: 2999, currency_code: "rub" },
                { amount: 32, currency_code: "eur" },
                { amount: 35, currency_code: "usd" },
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
          title: "Брюки чинос",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Брюки")!.id,
          ],
          description:
            "Классические чёрные брюки чинос приталенного кроя с минималистичным дизайном. Изготовлены из мягкого прочного хлопка с добавлением эластана для комфорта. Боковые карманы, шлёвки для ремня и застёжка на пуговицу. Подходят как для повседневного, так и для делового образа.",
          handle: "chino-pants",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Брюки чинос — купить онлайн",
            seo_description:
              "Классические чёрные брюки чинос приталенного кроя. Размеры S–XL. Доставка по всем странам ЕАЭС.",
          },
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
              options: { Размер: "S" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
              ],
            },
            {
              title: "M",
              sku: "CHINO-M",
              options: { Размер: "M" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
              ],
            },
            {
              title: "L",
              sku: "CHINO-L",
              options: { Размер: "L" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
              ],
            },
            {
              title: "XL",
              sku: "CHINO-XL",
              options: { Размер: "XL" },
              prices: [
                { amount: 2799, currency_code: "rub" },
                { amount: 30, currency_code: "eur" },
                { amount: 33, currency_code: "usd" },
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
          title: "Пуховик",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Верхняя одежда")!.id,
          ],
          description:
            "Утеплённый чёрный пуховик, созданный для тепла и комфорта в холодную погоду. Высокий воротник, застёжка-молния с кнопками и несколько карманов для удобства. Лёгкий, но прочный — для повседневной носки и активного отдыха.",
          handle: "puffer-jacket",
          weight: 1200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Пуховик — купить онлайн",
            seo_description:
              "Утеплённый чёрный пуховик для холодной погоды. Размеры S–XL. Доставка по всем странам ЕАЭС.",
          },
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
              options: { Размер: "S" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
              ],
            },
            {
              title: "M",
              sku: "PUFFER-M",
              options: { Размер: "M" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
              ],
            },
            {
              title: "L",
              sku: "PUFFER-L",
              options: { Размер: "L" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
              ],
            },
            {
              title: "XL",
              sku: "PUFFER-XL",
              options: { Размер: "XL" },
              prices: [
                { amount: 5999, currency_code: "rub" },
                { amount: 65, currency_code: "eur" },
                { amount: 70, currency_code: "usd" },
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
          title: "Беспроводные наушники",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Наушники")!.id,
          ],
          description:
            "Матово-чёрные беспроводные наушники с удобной полноразмерной конструкцией для погружающего звучания. Чистый звук, мощный бас и долгое время работы от аккумулятора. Созданы для повседневного использования дома, в офисе и в дороге.",
          handle: "wireless-headphones",
          weight: 300,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Беспроводные наушники — купить онлайн",
            seo_description:
              "Матово-чёрные беспроводные наушники с долгим временем работы. Доставка по всем странам ЕАЭС.",
          },
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
              title: "Чёрный",
              sku: "HEADPHONES",
              options: { Цвет: "Чёрный" },
              prices: [
                { amount: 7999, currency_code: "rub" },
                { amount: 86, currency_code: "eur" },
                { amount: 94, currency_code: "usd" },
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
          title: "Электровелосипед",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Электротранспорт")!.id,
          ],
          description:
            "Матово-чёрный электрический горный велосипед, созданный для производительности и повседневной универсальности. Лёгкая алюминиевая рама, встроенный аккумулятор и мощный мотор для плавной езды с электроподдержкой на любой местности. Подходит как для городских поездок, так и для бездорожья.",
          handle: "electric-bike",
          weight: 20000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Электровелосипед — купить онлайн",
            seo_description:
              "Матово-чёрный электрический горный велосипед для города и бездорожья. Доставка по всем странам ЕАЭС.",
          },
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
              title: "Чёрный",
              sku: "BIKE",
              options: { Цвет: "Чёрный" },
              prices: [
                { amount: 89999, currency_code: "rub" },
                { amount: 970, currency_code: "eur" },
                { amount: 1050, currency_code: "usd" },
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
          title: "Сервировочная тарелка",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Посуда")!.id,
          ],
          description:
            "Скульптурная сервировочная тарелка из нержавеющей стали с зеркальной полировкой. Плавная современная форма добавляет изысканности любой сервировке стола. Идеальна для фруктов, закусок или в качестве декоративного элемента. Создана для функциональности и визуального эффекта: красиво отражает свет и дополняет любой современный интерьер дома или ресторана.",
          handle: "serving-plate",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Сервировочная тарелка — купить онлайн",
            seo_description:
              "Сервировочная тарелка из нержавеющей стали с зеркальной полировкой. Доставка по всем странам ЕАЭС.",
          },
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
              title: "Серебристый",
              sku: "PLATE",
              options: { Цвет: "Серебристый" },
              prices: [
                { amount: 3499, currency_code: "rub" },
                { amount: 38, currency_code: "eur" },
                { amount: 41, currency_code: "usd" },
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
          title: "Чашка для эспрессо",
          category_ids: [categoryResult.find((cat) => cat.name === "Кофе")!.id],
          description:
            "Чёрные керамические чашки для эспрессо, рассчитанные на одинарную или двойную порцию. Прочные, хорошо сохраняют тепло и подходят для мытья в посудомоечной машине.",
          handle: "espresso-cup",
          weight: 200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            seo_title: "Чашка для эспрессо — купить онлайн",
            seo_description:
              "Чёрные керамические чашки для эспрессо. Доставка по всем странам ЕАЭС.",
          },
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
              title: "Чёрный",
              sku: "ESPRESSO-CUP",
              options: { Цвет: "Чёрный" },
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
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding color option value metadata...");
  const productModuleService = container.resolve(Modules.PRODUCT);
  const colorHexByValue: Record<string, string> = {
    Чёрный: "#111111",
    Белый: "#ffffff",
    Серебристый: "#c0c0c0",
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
          title: "Новинки",
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

  const translateTerm = (value: string, locale: SeedLocale) =>
    seedTranslations[locale].terms[value] ?? value;

  for (const category of [...parentCategories, ...childCategories]) {
    addTranslations("product_category", category.id, {
      ru: { name: seedTranslations.ru.categories[category.handle] },
      en: { name: seedTranslations.en.categories[category.handle] },
      fr: { name: seedTranslations.fr.categories[category.handle] },
      es: { name: seedTranslations.es.categories[category.handle] },
    });
  }

  for (const productCollection of collectionsResult) {
    addTranslations("product_collection", productCollection.id, {
      ru: { title: seedTranslations.ru.collections[productCollection.handle] },
      en: { title: seedTranslations.en.collections[productCollection.handle] },
      fr: { title: seedTranslations.fr.collections[productCollection.handle] },
      es: { title: seedTranslations.es.collections[productCollection.handle] },
    });
  }

  for (const seededRegion of regionResult) {
    addTranslations("region", seededRegion.id, {
      ru: { name: seedTranslations.ru.regions[seededRegion.name] },
      en: { name: seedTranslations.en.regions[seededRegion.name] },
      fr: { name: seedTranslations.fr.regions[seededRegion.name] },
      es: { name: seedTranslations.es.regions[seededRegion.name] },
    });
  }

  const { data: seededProductOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values.id", "values.value"],
  });

  for (const option of seededProductOptions) {
    addTranslations("product_option", option.id, {
      ru: { title: translateTerm(option.title, "ru") },
      en: { title: translateTerm(option.title, "en") },
      fr: { title: translateTerm(option.title, "fr") },
      es: { title: translateTerm(option.title, "es") },
    });

    for (const optionValue of option.values ?? []) {
      addTranslations("product_option_value", optionValue.id, {
        ru: { value: translateTerm(optionValue.value, "ru") },
        en: { value: translateTerm(optionValue.value, "en") },
        fr: { value: translateTerm(optionValue.value, "fr") },
        es: { value: translateTerm(optionValue.value, "es") },
      });
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
    addTranslations("product", product.id, {
      ru: seedTranslations.ru.products[product.handle],
      en: seedTranslations.en.products[product.handle],
      fr: seedTranslations.fr.products[product.handle],
      es: seedTranslations.es.products[product.handle],
    });

    for (const variant of product.variants ?? []) {
      const localizeTitle = (locale: SeedLocale) =>
        variant.title
          .split(" / ")
          .map((segment: string) => translateTerm(segment, locale))
          .join(" / ");
      addTranslations("product_variant", variant.id, {
        ru: { title: localizeTitle("ru") },
        en: { title: localizeTitle("en") },
        fr: { title: localizeTitle("fr") },
        es: { title: localizeTitle("es") },
      });
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

    addTranslations("shipping_option", shippingOption.id, {
      ru: { name: seedTranslations.ru.shippingOptions[optionType.code] },
      en: { name: seedTranslations.en.shippingOptions[optionType.code] },
      fr: { name: seedTranslations.fr.shippingOptions[optionType.code] },
      es: { name: seedTranslations.es.shippingOptions[optionType.code] },
    });

    addTranslations("shipping_option_type", optionType.id, {
      ru: seedTranslations.ru.shippingTypes[optionType.code],
      en: seedTranslations.en.shippingTypes[optionType.code],
      fr: seedTranslations.fr.shippingTypes[optionType.code],
      es: seedTranslations.es.shippingTypes[optionType.code],
    });
  }

  const { data: seededRefundReasons } = await query.graph({
    entity: "refund_reason",
    fields: ["id", "label", "description"],
  });

  for (const refundReason of seededRefundReasons) {
    addTranslations("refund_reason", refundReason.id, {
      ru: seedTranslations.ru.refundReasons[refundReason.label],
      en: seedTranslations.en.refundReasons[refundReason.label],
      fr: seedTranslations.fr.refundReasons[refundReason.label],
      es: seedTranslations.es.refundReasons[refundReason.label],
    });
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

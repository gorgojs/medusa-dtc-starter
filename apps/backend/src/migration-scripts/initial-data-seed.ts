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
          supported_locales: [
            { locale_code: "ru" },
            { locale_code: "en" },
            { locale_code: "fr" },
            { locale_code: "es" },
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
          values: ["Чёрный", "Белый"],
        },
      ],
    },
  });
  const sizeOption = productOptionsResult.find((o) => o.title === "Размер")!;
  const colorOption = productOptionsResult.find((o) => o.title === "Цвет")!;

  logger.info("Seeding color option value metadata...");
  const productModuleService = container.resolve(Modules.PRODUCT);
  const colorHexByValue: Record<string, string> = {
    Чёрный: "#111111",
    Белый: "#ffffff",
  };
  const colorOptionValues = await productModuleService.listProductOptionValues({
    option_id: colorOption.id,
  });
  await Promise.all(
    colorOptionValues
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

  logger.info("Seeding translations...");

  const translationModuleService = container.resolve(Modules.TRANSLATION);

  await translationModuleService.createLocales([
    { code: "ru", name: "Русский" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
  ]);

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
    byLocale: Record<string, Record<string, unknown>>,
  ) => {
    for (const [localeCode, fields] of Object.entries(byLocale)) {
      const cleaned = clean(fields);
      if (Object.keys(cleaned).length) {
        translations.push({
          reference,
          reference_id: referenceId,
          locale_code: localeCode,
          translations: cleaned,
        });
      }
    }
  };

  type Localized = { en: string; fr: string; es: string };
  type TitleDesc = { title: string; description: string };
  type LabelDesc = { label: string; description: string };

  const terms: Record<string, Localized> = {
    Размер: { en: "Size", fr: "Taille", es: "Talla" },
    Цвет: { en: "Color", fr: "Couleur", es: "Color" },
    Чёрный: { en: "Black", fr: "Noir", es: "Negro" },
    Белый: { en: "White", fr: "Blanc", es: "Blanco" },
  };
  const term = (value: string, locale: keyof Localized) =>
    terms[value]?.[locale] ?? value;

  const categoryByLocale: Record<string, Localized> = {
    Футболки: { en: "T-Shirts", fr: "T-shirts", es: "Camisetas" },
    Толстовки: { en: "Sweatshirts", fr: "Sweat-shirts", es: "Sudaderas" },
    Брюки: { en: "Pants", fr: "Pantalons", es: "Pantalones" },
    Мерч: { en: "Merch", fr: "Merch", es: "Merch" },
  };

  const productByLocale: Record<
    string,
    { en: TitleDesc; fr: TitleDesc; es: TitleDesc }
  > = {
    "t-shirt": {
      en: {
        title: "Medusa T-Shirt",
        description:
          "Reimagine the feel of a classic tee. With our cotton T-shirts, everyday essentials are no longer ordinary.",
      },
      fr: {
        title: "T-shirt Medusa",
        description:
          "Redécouvrez la sensation d'un t-shirt classique. Avec nos t-shirts en coton, les indispensables du quotidien n'ont plus rien d'ordinaire.",
      },
      es: {
        title: "Camiseta Medusa",
        description:
          "Reinventa la sensación de una camiseta clásica. Con nuestras camisetas de algodón, lo esencial del día a día deja de ser ordinario.",
      },
    },
    sweatshirt: {
      en: {
        title: "Medusa Sweatshirt",
        description:
          "Reimagine the feel of a classic sweatshirt. With our cotton sweatshirt, everyday essentials are no longer ordinary.",
      },
      fr: {
        title: "Sweat-shirt Medusa",
        description:
          "Redécouvrez la sensation d'un sweat-shirt classique. Avec notre sweat-shirt en coton, les indispensables du quotidien n'ont plus rien d'ordinaire.",
      },
      es: {
        title: "Sudadera Medusa",
        description:
          "Reinventa la sensación de una sudadera clásica. Con nuestra sudadera de algodón, lo esencial del día a día deja de ser ordinario.",
      },
    },
    sweatpants: {
      en: {
        title: "Medusa Sweatpants",
        description:
          "Reimagine the feel of classic sweatpants. With our cotton sweatpants, everyday essentials are no longer ordinary.",
      },
      fr: {
        title: "Pantalon de survêtement Medusa",
        description:
          "Redécouvrez la sensation d'un pantalon de survêtement classique. Avec nos pantalons de survêtement en coton, les indispensables du quotidien n'ont plus rien d'ordinaire.",
      },
      es: {
        title: "Pantalón deportivo Medusa",
        description:
          "Reinventa la sensación de un pantalón deportivo clásico. Con nuestros pantalones deportivos de algodón, lo esencial del día a día deja de ser ordinario.",
      },
    },
    shorts: {
      en: {
        title: "Medusa Shorts",
        description:
          "Reimagine the feel of classic shorts. With our cotton shorts, everyday essentials are no longer ordinary.",
      },
      fr: {
        title: "Short Medusa",
        description:
          "Redécouvrez la sensation d'un short classique. Avec nos shorts en coton, les indispensables du quotidien n'ont plus rien d'ordinaire.",
      },
      es: {
        title: "Pantalón corto Medusa",
        description:
          "Reinventa la sensación de un pantalón corto clásico. Con nuestros pantalones cortos de algodón, lo esencial del día a día deja de ser ordinario.",
      },
    },
  };

  const collectionByLocale: Record<string, Localized> = {
    all: { en: "All products", fr: "Tous les produits", es: "Todos los productos" },
  };

  const regionByLocale: Record<string, Localized> = {
    СНГ: { en: "CIS", fr: "CEI", es: "CEI" },
  };

  const shippingOptionByLocale: Record<string, Localized> = {
    "Доставка курьером": {
      en: "Courier delivery",
      fr: "Livraison par coursier",
      es: "Entrega por mensajería",
    },
    Самовывоз: { en: "Pickup", fr: "Retrait", es: "Recogida" },
  };

  const shippingTypeByLocale: Record<
    string,
    { en: LabelDesc; fr: LabelDesc; es: LabelDesc }
  > = {
    courier: {
      en: { label: "Courier", description: "Delivery within 2–3 days." },
      fr: { label: "Coursier", description: "Livraison sous 2 à 3 jours." },
      es: { label: "Mensajería", description: "Entrega en 2–3 días." },
    },
    pickup: {
      en: { label: "Pickup", description: "Pick up at a pickup point." },
      fr: { label: "Retrait", description: "À retirer en point relais." },
      es: { label: "Recogida", description: "Recoger en un punto de recogida." },
    },
  };

  const refundReasonByLocale: Record<
    string,
    { ru: LabelDesc; fr: LabelDesc; es: LabelDesc }
  > = {
    "Shipping Issue": {
      ru: {
        label: "Проблема с доставкой",
        description:
          "Возврат из-за потерянной, задержанной или неверно доставленной посылки",
      },
      fr: {
        label: "Problème de livraison",
        description: "Remboursement pour un colis perdu, retardé ou mal livré",
      },
      es: {
        label: "Problema de envío",
        description: "Reembolso por un envío perdido, retrasado o mal entregado",
      },
    },
    "Customer Care Adjustment": {
      ru: {
        label: "Компенсация от поддержки",
        description: "Возврат в качестве компенсации за неудобства",
      },
      fr: {
        label: "Geste commercial",
        description:
          "Remboursement accordé à titre commercial ou en compensation d'un désagrément",
      },
      es: {
        label: "Ajuste de atención al cliente",
        description:
          "Reembolso concedido como cortesía o compensación por las molestias",
      },
    },
    "Pricing Error": {
      ru: {
        label: "Ошибка в цене",
        description:
          "Возврат для исправления переплаты, отсутствующей скидки или неверной цены",
      },
      fr: {
        label: "Erreur de prix",
        description:
          "Remboursement pour corriger un trop-perçu, une remise manquante ou un prix incorrect",
      },
      es: {
        label: "Error de precio",
        description:
          "Reembolso para corregir un cobro excesivo, un descuento faltante o un precio incorrecto",
      },
    },
  };

  for (const category of categoryResult) {
    const t = categoryByLocale[category.name];
    addTranslations("product_category", category.id, {
      ru: { name: category.name },
      en: { name: t?.en },
      fr: { name: t?.fr },
      es: { name: t?.es },
    });
  }

  for (const productCollection of collectionsResult) {
    const t = collectionByLocale[productCollection.handle];
    addTranslations("product_collection", productCollection.id, {
      ru: { title: productCollection.title },
      en: { title: t?.en },
      fr: { title: t?.fr },
      es: { title: t?.es },
    });
  }

  for (const seededRegion of regionResult) {
    const t = regionByLocale[seededRegion.name];
    addTranslations("region", seededRegion.id, {
      ru: { name: seededRegion.name },
      en: { name: t?.en },
      fr: { name: t?.fr },
      es: { name: t?.es },
    });
  }

  const { data: seededProductOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values.id", "values.value"],
    filters: {
      id: productOptionsResult.map((option) => option.id),
    },
  });

  for (const option of seededProductOptions) {
    addTranslations("product_option", option.id, {
      ru: { title: option.title },
      en: { title: term(option.title, "en") },
      fr: { title: term(option.title, "fr") },
      es: { title: term(option.title, "es") },
    });

    for (const optionValue of option.values ?? []) {
      addTranslations("product_option_value", optionValue.id, {
        ru: { value: optionValue.value },
        en: { value: term(optionValue.value, "en") },
        fr: { value: term(optionValue.value, "fr") },
        es: { value: term(optionValue.value, "es") },
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
    const t = productByLocale[product.handle];
    addTranslations("product", product.id, {
      ru: { title: product.title, description: product.description },
      en: t?.en ?? {},
      fr: t?.fr ?? {},
      es: t?.es ?? {},
    });

    for (const variant of product.variants ?? []) {
      const localizeTitle = (locale: keyof Localized) =>
        variant.title
          .split(" / ")
          .map((segment: string) => term(segment, locale))
          .join(" / ");
      addTranslations("product_variant", variant.id, {
        ru: { title: variant.title },
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
    const nameT = shippingOptionByLocale[shippingOption.name];
    addTranslations("shipping_option", shippingOption.id, {
      ru: { name: shippingOption.name },
      en: { name: nameT?.en },
      fr: { name: nameT?.fr },
      es: { name: nameT?.es },
    });

    const optionType = shippingOption.type;
    const typeT = optionType ? shippingTypeByLocale[optionType.code] : undefined;
    if (optionType) {
      addTranslations("shipping_option_type", optionType.id, {
        ru: { label: optionType.label, description: optionType.description },
        en: typeT?.en ?? {},
        fr: typeT?.fr ?? {},
        es: typeT?.es ?? {},
      });
    }
  }

  const { data: seededRefundReasons } = await query.graph({
    entity: "refund_reason",
    fields: ["id", "label", "description"],
  });

  for (const refundReason of seededRefundReasons) {
    const t = refundReasonByLocale[refundReason.label];
    addTranslations("refund_reason", refundReason.id, {
      en: { label: refundReason.label, description: refundReason.description },
      ru: t?.ru ?? {},
      fr: t?.fr ?? {},
      es: t?.es ?? {},
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

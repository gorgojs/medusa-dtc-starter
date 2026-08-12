export type ProductText = { title: string; description: string };
export type LabelText = { label: string; description: string };

export type SeedTranslations = {
  terms: Record<string, string>;
  categories: Record<string, string>;
  products: Record<string, ProductText>;
  collections: Record<string, string>;
  regions: Record<string, string>;
  shippingOptions: Record<string, string>;
  shippingTypes: Record<string, LabelText>;
  refundReasons: Record<string, LabelText>;
};

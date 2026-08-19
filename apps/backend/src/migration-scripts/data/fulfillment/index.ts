import shippingOptions from "./json/shipping-options.json";

export type SeedShippingOption = {
  code: string;
  name: string;
  label: string;
  description: string;
  delivery_days_min: number;
  delivery_days_max: number;
};

export const SEED_SHIPPING_OPTIONS: SeedShippingOption[] = shippingOptions;

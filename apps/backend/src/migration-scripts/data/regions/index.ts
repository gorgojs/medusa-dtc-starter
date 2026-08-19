import cn from "./json/cn.json";
import fr from "./json/fr.json";
import mx from "./json/mx.json";
import ru from "./json/ru.json";
import us from "./json/us.json";

export type SeedStockLocation = {
  name: string;
  address: {
    address_1: string;
    country_code: string;
  };
};

export type SeedRegion = {
  name: string;
  currency_code: string;
  countries: string[];
  stock_location: SeedStockLocation;
  shipping_prices: Record<string, number>;
  product_prices: Record<string, number>;
};

export const SEED_REGIONS: SeedRegion[] = [cn, fr, mx, ru, us];

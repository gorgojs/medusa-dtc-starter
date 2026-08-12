import type { SeedTranslations } from "../types";

export const en: SeedTranslations = {
  terms: {
    Размер: "Size",
    Цвет: "Color",
    Чёрный: "Black",
    Белый: "White",
    Серебристый: "Silver",
  },
  categories: {
    clothing: "Clothing",
    electronics: "Electronics",
    home: "Home",
    shirts: "T-Shirts",
    sweatshirts: "Sweatshirts",
    pants: "Pants",
    outerwear: "Outerwear",
    shorts: "Shorts",
    headphones: "Headphones",
    "e-transport": "Electric Transport",
    tableware: "Tableware",
    coffee: "Coffee",
  },
  products: {
    "t-shirt": {
      title: "Medusa T-Shirt",
      description:
        "Reimagine the feel of a classic tee. With our cotton T-shirts, everyday essentials are no longer ordinary.",
    },
    sweatshirt: {
      title: "Medusa Sweatshirt",
      description:
        "Reimagine the feel of a classic sweatshirt. With our cotton sweatshirt, everyday essentials are no longer ordinary.",
    },
    sweatpants: {
      title: "Medusa Sweatpants",
      description:
        "Reimagine the feel of classic sweatpants. With our cotton sweatpants, everyday essentials are no longer ordinary.",
    },
    shorts: {
      title: "Medusa Shorts",
      description:
        "Reimagine the feel of classic shorts. With our cotton shorts, everyday essentials are no longer ordinary.",
    },
    hoodie: {
      title: "Hoodie",
      description:
        "Classic black hoodie made from soft cotton fabric for everyday comfort. Features a relaxed fit, adjustable drawstring hood and front kangaroo pocket. Simple and versatile for layering in any season.",
    },
    "chino-pants": {
      title: "Chino Pants",
      description:
        "Classic black chino pants with a tailored fit and minimal design. Made from soft, durable cotton fabric with a hint of stretch for comfort. Features side pockets, belt loops and a button closure. Ideal for both casual and smart wear.",
    },
    "puffer-jacket": {
      title: "Puffer Jacket",
      description:
        "Insulated black puffer jacket designed for warmth and comfort in cold weather. Features a high collar, front zipper with snap closure, and multiple pockets for functionality. Lightweight yet durable for everyday wear or outdoor use.",
    },
    "wireless-headphones": {
      title: "Wireless Over-Ear Headphones",
      description:
        "Matte black wireless headphones with a comfortable over-ear design for immersive listening. Provide clear sound, strong bass and long battery life. Built for everyday use at home, in the office or on the go.",
    },
    "electric-bike": {
      title: "Electric Bike",
      description:
        "Matte black electric mountain bike built for performance and everyday versatility. Features a lightweight aluminum frame, integrated battery, and powerful motor for smooth assisted riding on all terrains. Designed for both city commutes and off-road trails.",
    },
    "serving-plate": {
      title: "Serving Plate",
      description:
        "A sculptural stainless steel serving plate with a polished mirror finish. Its fluid, modern shape adds a refined touch to any table setting. Perfect for fruit, appetizers or decorative display. Designed for both functionality and visual impact, it reflects light beautifully and complements any contemporary home or restaurant style.",
    },
    "espresso-cup": {
      title: "Espresso Cup",
      description:
        "Black ceramic espresso cups designed for single or double shots. Durable, heat retaining and dishwasher safe.",
    },
  },
  collections: {
    new: "New Arrivals",
  },
  regions: {
    ЕАЭС: "CIS",
  },
  shippingOptions: {
    courier: "Courier delivery",
    pickup: "Pickup",
  },
  shippingTypes: {
    courier: { label: "Courier", description: "Delivery within 2–3 days." },
    pickup: { label: "Pickup", description: "Pick up at a pickup point." },
  },
  refundReasons: {
    "Shipping Issue": {
      label: "Shipping Issue",
      description: "Refund due to lost, delayed, or misdelivered shipment",
    },
    "Customer Care Adjustment": {
      label: "Customer Care Adjustment",
      description: "Refund given as goodwill or compensation for inconvenience",
    },
    "Pricing Error": {
      label: "Pricing Error",
      description:
        "Refund to correct an overcharge, missing discount, or incorrect price",
    },
  },
};

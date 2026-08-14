import type { SeedTranslations } from "../types";

export const localeName = "Español";

export const translations: SeedTranslations = {
  terms: {
    Size: "Talla",
    Color: "Color",
    Black: "Negro",
    White: "Blanco",
    Silver: "Plateado",
  },
  categories: {
    clothing: "Ropa",
    electronics: "Electrónica",
    home: "Hogar",
    shirts: "Camisetas",
    sweatshirts: "Sudaderas",
    pants: "Pantalones",
    outerwear: "Ropa de abrigo",
    shorts: "Pantalones cortos",
    headphones: "Auriculares",
    "e-transport": "Transporte eléctrico",
    tableware: "Vajilla",
    coffee: "Café",
  },
  products: {
    "t-shirt": {
      title: "Camiseta Medusa",
      description:
        "Reinventa la sensación de una camiseta clásica. Con nuestras camisetas de algodón, lo esencial del día a día deja de ser ordinario.",
    },
    sweatshirt: {
      title: "Sudadera Medusa",
      description:
        "Reinventa la sensación de una sudadera clásica. Con nuestra sudadera de algodón, lo esencial del día a día deja de ser ordinario.",
    },
    sweatpants: {
      title: "Pantalón deportivo Medusa",
      description:
        "Reinventa la sensación de un pantalón deportivo clásico. Con nuestros pantalones deportivos de algodón, lo esencial del día a día deja de ser ordinario.",
    },
    shorts: {
      title: "Pantalón corto Medusa",
      description:
        "Reinventa la sensación de un pantalón corto clásico. Con nuestros pantalones cortos de algodón, lo esencial del día a día deja de ser ordinario.",
    },
    hoodie: {
      title: "Sudadera con capucha",
      description:
        "Sudadera con capucha negra clásica de algodón suave para la comodidad diaria. Corte relajado, capucha con cordón ajustable y bolsillo canguro delantero. Sencilla y versátil para combinar en cualquier temporada.",
    },
    "chino-pants": {
      title: "Pantalón chino",
      description:
        "Pantalón chino negro clásico de corte entallado y diseño minimalista. Confeccionado en un tejido de algodón suave y resistente con un toque de elastano para mayor comodidad. Bolsillos laterales, trabillas para el cinturón y cierre de botón. Ideal tanto para un look casual como elegante.",
    },
    "puffer-jacket": {
      title: "Chaqueta acolchada",
      description:
        "Chaqueta acolchada negra con aislamiento, diseñada para brindar calidez y comodidad en climas fríos. Cuello alto, cierre de cremallera con botones a presión y varios bolsillos funcionales. Ligera pero resistente, para el uso diario o al aire libre.",
    },
    "wireless-headphones": {
      title: "Auriculares inalámbricos",
      description:
        "Auriculares inalámbricos en negro mate con un cómodo diseño over-ear para una escucha envolvente. Ofrecen un sonido claro, graves potentes y una larga duración de batería. Pensados para el uso diario en casa, en la oficina o de camino.",
    },
    "electric-bike": {
      title: "Bicicleta eléctrica",
      description:
        "Bicicleta de montaña eléctrica en negro mate, creada para el rendimiento y la versatilidad diaria. Cuadro de aluminio ligero, batería integrada y motor potente para una conducción asistida suave en todo tipo de terreno. Diseñada tanto para trayectos urbanos como para rutas todoterreno.",
    },
    "serving-plate": {
      title: "Plato de servir",
      description:
        "Plato de servir escultural de acero inoxidable con acabado de espejo pulido. Su forma fluida y moderna aporta un toque refinado a cualquier mesa. Perfecto para fruta, aperitivos o como pieza decorativa. Diseñado para combinar funcionalidad e impacto visual, refleja la luz de forma espléndida y complementa cualquier estilo contemporáneo de hogar o restaurante.",
    },
    "espresso-cup": {
      title: "Taza de espresso",
      description:
        "Tazas de espresso de cerámica negra diseñadas para uno o dos shots. Resistentes, conservan el calor y aptas para lavavajillas.",
    },
  },
  collections: {
    new: "Novedades",
  },
  shippingOptions: {
    courier: "Entrega por mensajería",
    pickup: "Recogida",
  },
  shippingTypes: {
    courier: { label: "Mensajería", description: "Entrega en 2–3 días." },
    pickup: {
      label: "Recogida",
      description: "Recoger en un punto de recogida.",
    },
  },
  refundReasons: {
    "Shipping Issue": {
      label: "Problema de envío",
      description: "Reembolso por un envío perdido, retrasado o mal entregado",
    },
    "Customer Care Adjustment": {
      label: "Ajuste de atención al cliente",
      description:
        "Reembolso concedido como cortesía o compensación por las molestias",
    },
    "Pricing Error": {
      label: "Error de precio",
      description:
        "Reembolso para corregir un cobro excesivo, un descuento faltante o un precio incorrecto",
    },
  },
};

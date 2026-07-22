import {
  getStoreAddress,
  getStorePhone,
  STORE_EMAIL,
  STORE_NAME,
} from "../constants";
import type { EmailTranslations } from "../types";

export const es: EmailTranslations = {
  layout: {
    copyright: (year) =>
      `© ${year} ${STORE_NAME}. Todos los derechos reservados.`,
    contactLine: `${getStoreAddress("es")} · ${STORE_EMAIL} · ${getStorePhone("es")}`,
  },
  common: {
    orderSummary: "Resumen del pedido",
    total: "Total",
    item: "Artículo",
    myOrders: "Mis pedidos",
    trackOrder: "Seguir pedido",
    questionsPrefix: "Si tienes alguna pregunta, escríbenos a",
    orCall: "o llama al",
  },
  orderPlaced: {
    preview: (id) => `Pedido n.º ${id} realizado correctamente`,
    subject: (id) => `Pedido n.º ${id} realizado — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, ¡tu pedido está realizado!`,
    headingAnon: "¡Tu pedido está realizado!",
    bodyOrder: (id) =>
      `El pedido <strong>n.º ${id}</strong> se ha realizado correctamente.`,
    deliveryCity: (city) => ` Enviamos a ${city}.`,
    watchStatus: "Puedes seguir el estado de tu pedido en tu cuenta.",
    textFallback: (id) =>
      `El pedido n.º ${id} se ha realizado.\n\nEstamos preparando tu pedido y lo enviaremos en breve.`,
  },
  orderCompleted: {
    preview: (id) => `Pedido n.º ${id} completado — ¡gracias por tu compra!`,
    subject: (id) => `Pedido n.º ${id} completado — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, ¡tu pedido está completado!`,
    headingAnon: "¡Tu pedido está completado!",
    bodyOrder: (id) =>
      `El pedido <strong>n.º ${id}</strong> se ha completado. ¡Gracias por elegirnos!`,
    deliveryCity: (city) => ` Entregado en ${city}.`,
    bodyPromo:
      "Nos encantaría verte de nuevo. Descubre las novedades en nuestra tienda.",
    textFallback: (id) =>
      `Pedido n.º ${id} completado. ¡Gracias por tu compra!`,
  },
  fulfillment: {
    preview: (id) => `Pedido n.º ${id} enviado`,
    subject: (id) => `Pedido n.º ${id} enviado — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, ¡tu pedido está en camino!`,
    headingAnon: "¡Tu pedido está en camino!",
    bodyOrder: (id) =>
      `El pedido <strong>n.º ${id}</strong> se ha entregado al servicio de mensajería.`,
    deliveryCity: (city) => ` Enviamos a ${city}.`,
    trackingTitle: "Información de seguimiento",
    trackLabel: "Número de seguimiento:",
    noTracking:
      "El número de seguimiento se añadirá a tu pedido en tu cuenta una vez que el paquete se entregue al transportista.",
    deliveryTime:
      "El plazo de entrega estándar es de 1 a 7 días laborables según tu región.",
    textTracking: (numbers) => `\nNúmero de seguimiento: ${numbers}`,
    textDelivery: "El plazo de entrega estándar es de 1 a 7 días laborables.",
    textFallback: (id) => `El pedido n.º ${id} ha sido enviado.`,
  },
  payment: {
    preview: (id) => `Pedido n.º ${id} pagado correctamente`,
    subject: (id) => `Pedido n.º ${id} pagado — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, ¡tu pedido está pagado!`,
    headingAnon: "¡Tu pedido está pagado!",
    bodyOrder: (id) =>
      `El pedido <strong>n.º ${id}</strong> se ha pagado correctamente. Ahora lo estamos preparando para su envío.`,
    watchStatus: "Puedes seguir el estado de tu pedido en tu cuenta.",
    textFallback: (id) =>
      `El pedido n.º ${id} ha sido pagado.\n\nEstamos preparando tu pedido y lo enviaremos en breve.`,
  },
  passwordReset: {
    preview:
      "Restablecimiento de contraseña — el enlace es válido durante 15 minutos",
    subject: `Restablecimiento de contraseña — ${STORE_NAME}`,
    heading: "Restablecimiento de contraseña",
    body: (email) =>
      `Hemos recibido una solicitud para restablecer la contraseña de <strong>${email}</strong>. Haz clic en el botón de abajo para establecer una nueva contraseña.`,
    button: "Restablecer contraseña",
    hint: "El enlace es válido durante <strong>15 minutos</strong>. Si no solicitaste el restablecimiento de la contraseña, simplemente ignora este correo.",
    textFallback: (url) =>
      `Restablecimiento de contraseña\n\nPara restablecer tu contraseña, sigue el enlace (válido durante 15 minutos):\n${url}\n\nSi no solicitaste el restablecimiento de la contraseña, simplemente ignora este correo.`,
  },
  orderTransfer: {
    preview: (id) => `Solicitud de transferencia del pedido n.º ${id}`,
    subject: (id) =>
      `Solicitud de transferencia del pedido n.º ${id} — ${STORE_NAME}`,
    heading: "Solicitud de transferencia del pedido",
    body: (id) =>
      `Se ha solicitado transferir el pedido <strong>n.º ${id}</strong> a otra cuenta. Si fuiste tú, confirma la transferencia con el botón de abajo. Si no, simplemente ignora este correo.`,
    button: "Revisar solicitud",
    hint: "El pedido solo se transferirá tras tu confirmación. Si no solicitaste la transferencia, no le pasará nada a tu pedido.",
    textFallback: (id, url) =>
      `Solicitud de transferencia del pedido n.º ${id}\n\nPara revisar la solicitud, sigue el enlace:\n${url}\n\nSi no solicitaste la transferencia, simplemente ignora este correo.`,
  },
  welcome: {
    preview: `¡Bienvenido a ${STORE_NAME}!`,
    subject: `¡Bienvenido a ${STORE_NAME}!`,
    headingWithName: (name) => `¡Bienvenido, ${name}!`,
    headingAnon: "¡Bienvenido!",
    body: "¡Gracias por registrarte! Tu cuenta está lista: ahora puedes comprar más rápido, seguir tus pedidos y guardar direcciones de entrega en tu cuenta.",
    button: "Empezar a comprar",
    textFallback: (url) =>
      `¡Bienvenido!\n\nGracias por registrarte. Tu cuenta está lista.\nEmpezar a comprar: ${url}`,
  },
};

import {
  getStoreAddress,
  getStorePhone,
  STORE_EMAIL,
  STORE_NAME,
} from "../constants";
import type { EmailTranslations } from "../types";

export const fr: EmailTranslations = {
  layout: {
    copyright: (year) => `© ${year} ${STORE_NAME}. Tous droits réservés.`,
    contactLine: `${getStoreAddress("fr")} · ${STORE_EMAIL} · ${getStorePhone("fr")}`,
  },
  common: {
    orderSummary: "Récapitulatif de la commande",
    total: "Total",
    item: "Article",
    myOrders: "Mes commandes",
    trackOrder: "Suivre la commande",
    questionsPrefix: "Si vous avez des questions, écrivez-nous à",
    orCall: "ou appelez le",
  },
  orderPlaced: {
    preview: (id) => `Commande n° ${id} passée avec succès`,
    subject: (id) => `Commande n° ${id} passée — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, votre commande est passée !`,
    headingAnon: "Votre commande est passée !",
    bodyOrder: (id) =>
      `La commande <strong>n° ${id}</strong> a bien été passée.`,
    deliveryCity: (city) => ` Livraison à ${city}.`,
    watchStatus:
      "Vous pouvez suivre l'état de votre commande dans votre compte.",
    textFallback: (id) =>
      `La commande n° ${id} a été passée.\n\nNous préparons votre commande et l'expédierons sous peu.`,
  },
  orderCompleted: {
    preview: (id) => `Commande n° ${id} terminée — merci pour votre achat !`,
    subject: (id) => `Commande n° ${id} terminée — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, votre commande est terminée !`,
    headingAnon: "Votre commande est terminée !",
    bodyOrder: (id) =>
      `La commande <strong>n° ${id}</strong> a été terminée. Merci de nous avoir choisis !`,
    deliveryCity: (city) => ` Livré à ${city}.`,
    bodyPromo:
      "Nous serions ravis de vous revoir. Découvrez les nouveautés dans notre boutique.",
    textFallback: (id) =>
      `Commande n° ${id} terminée. Merci pour votre achat !`,
  },
  fulfillment: {
    preview: (id) => `Commande n° ${id} expédiée`,
    subject: (id) => `Commande n° ${id} expédiée — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, votre commande est en route !`,
    headingAnon: "Votre commande est en route !",
    bodyOrder: (id) =>
      `La commande <strong>n° ${id}</strong> a été remise au service de livraison.`,
    deliveryCity: (city) => ` Livraison à ${city}.`,
    trackingTitle: "Informations de suivi",
    trackLabel: "Numéro de suivi :",
    noTracking:
      "Le numéro de suivi sera ajouté à votre commande dans votre compte une fois le colis remis au transporteur.",
    deliveryTime:
      "Le délai de livraison standard est de 1 à 7 jours ouvrables selon votre région.",
    textTracking: (numbers) => `\nNuméro de suivi : ${numbers}`,
    textDelivery:
      "Le délai de livraison standard est de 1 à 7 jours ouvrables.",
    textFallback: (id) => `La commande n° ${id} a été expédiée.`,
  },
  payment: {
    preview: (id) => `Commande n° ${id} payée avec succès`,
    subject: (id) => `Commande n° ${id} payée — ${STORE_NAME}`,
    headingWithName: (name) => `${name}, votre commande est payée !`,
    headingAnon: "Votre commande est payée !",
    bodyOrder: (id) =>
      `La commande <strong>n° ${id}</strong> a bien été payée. Nous la préparons maintenant pour l'expédition.`,
    watchStatus:
      "Vous pouvez suivre l'état de votre commande dans votre compte.",
    textFallback: (id) =>
      `La commande n° ${id} a été payée.\n\nNous préparons votre commande et l'expédierons sous peu.`,
  },
  passwordReset: {
    preview: "Réinitialisation du mot de passe — lien valable 15 minutes",
    subject: `Réinitialisation du mot de passe — ${STORE_NAME}`,
    heading: "Réinitialisation du mot de passe",
    body: (email) =>
      `Nous avons reçu une demande de réinitialisation du mot de passe pour <strong>${email}</strong>. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.`,
    button: "Réinitialiser le mot de passe",
    hint: "Le lien est valable pendant <strong>15 minutes</strong>. Si vous n'avez pas demandé la réinitialisation du mot de passe, ignorez simplement cet e-mail.",
    textFallback: (url) =>
      `Réinitialisation du mot de passe\n\nPour réinitialiser votre mot de passe, suivez le lien (valable 15 minutes) :\n${url}\n\nSi vous n'avez pas demandé la réinitialisation du mot de passe, ignorez simplement cet e-mail.`,
  },
  orderTransfer: {
    preview: (id) => `Demande de transfert de la commande n° ${id}`,
    subject: (id) =>
      `Demande de transfert de la commande n° ${id} — ${STORE_NAME}`,
    heading: "Demande de transfert de commande",
    body: (id) =>
      `Une demande de transfert de la commande <strong>n° ${id}</strong> vers un autre compte a été effectuée. Si c'était vous, confirmez le transfert à l'aide du bouton ci-dessous. Sinon, ignorez simplement cet e-mail.`,
    button: "Examiner la demande",
    hint: "La commande ne sera transférée qu'après votre confirmation. Si vous n'avez pas demandé de transfert, rien n'arrivera à votre commande.",
    textFallback: (id, url) =>
      `Demande de transfert de la commande n° ${id}\n\nPour examiner la demande, suivez le lien :\n${url}\n\nSi vous n'avez pas demandé de transfert, ignorez simplement cet e-mail.`,
  },
  welcome: {
    preview: `Bienvenue chez ${STORE_NAME} !`,
    subject: `Bienvenue chez ${STORE_NAME} !`,
    headingWithName: (name) => `Bienvenue, ${name} !`,
    headingAnon: "Bienvenue !",
    body: "Merci pour votre inscription ! Votre compte est prêt — vous pouvez désormais commander plus rapidement, suivre vos commandes et enregistrer vos adresses de livraison dans votre compte.",
    button: "Commencer les achats",
    textFallback: (url) =>
      `Bienvenue !\n\nMerci pour votre inscription. Votre compte est prêt.\nCommencer les achats : ${url}`,
  },
};

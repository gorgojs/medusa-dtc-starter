export type EmailTranslations = {
  layout: {
    copyright: (year: number) => string;
    contactLine: string;
  };
  common: {
    orderSummary: string;
    total: string;
    item: string;
    myOrders: string;
    trackOrder: string;
    questionsPrefix: string;
    orCall: string;
  };
  orderPlaced: {
    preview: (id: string | number) => string;
    subject: (id: string | number) => string;
    headingWithName: (name: string) => string;
    headingAnon: string;
    bodyOrder: (id: string | number) => string;
    deliveryCity: (city: string) => string;
    watchStatus: string;
    textFallback: (id: string | number) => string;
  };
  orderCompleted: {
    preview: (id: string | number) => string;
    subject: (id: string | number) => string;
    headingWithName: (name: string) => string;
    headingAnon: string;
    bodyOrder: (id: string | number) => string;
    deliveryCity: (city: string) => string;
    bodyPromo: string;
    textFallback: (id: string | number) => string;
  };
  fulfillment: {
    preview: (id: string | number) => string;
    subject: (id: string | number) => string;
    headingWithName: (name: string) => string;
    headingAnon: string;
    bodyOrder: (id: string | number) => string;
    deliveryCity: (city: string) => string;
    trackingTitle: string;
    trackLabel: string;
    noTracking: string;
    deliveryTime: string;
    textTracking: (numbers: string) => string;
    textDelivery: string;
    textFallback: (id: string | number) => string;
  };
  payment: {
    preview: (id: string | number) => string;
    subject: (id: string | number) => string;
    headingWithName: (name: string) => string;
    headingAnon: string;
    bodyOrder: (id: string | number) => string;
    watchStatus: string;
    textFallback: (id: string | number) => string;
  };
  passwordReset: {
    preview: string;
    subject: string;
    heading: string;
    body: (email: string) => string;
    button: string;
    hint: string;
    textFallback: (url: string) => string;
  };
  orderTransfer: {
    preview: (id: string | number) => string;
    subject: (id: string | number) => string;
    heading: string;
    body: (id: string | number) => string;
    button: string;
    hint: string;
    textFallback: (id: string | number, url: string) => string;
  };
  welcome: {
    preview: string;
    subject: string;
    headingWithName: (name: string) => string;
    headingAnon: string;
    body: string;
    button: string;
    textFallback: (url: string) => string;
  };
};

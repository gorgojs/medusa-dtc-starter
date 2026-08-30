import {
  Button,
  Heading,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import * as s from "./lib/styles";
import {
  type EmailLocale,
  DEFAULT_EMAIL_LOCALE,
  getEmailTranslator,
  STOREFRONT_URL,
  STORE_EMAIL,
  STORE_PHONE,
} from "./i18n";

export type OrderFulfillmentCreatedEmailProps = {
  order: {
    id: string;
    display_id?: number | string;
    email?: string;
    currency_code?: string;
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      address_1?: string;
      city?: string;
    };
  };
  fulfillment?: {
    tracking_numbers?: string[];
    tracking_links?: Array<{ tracking_number?: string; url?: string }>;
    provider_id?: string;
  };
  locale?: EmailLocale;
};

export function OrderFulfillmentCreatedEmail({
  order,
  fulfillment,
  locale = DEFAULT_EMAIL_LOCALE,
}: OrderFulfillmentCreatedEmailProps) {
  const { t, html } = getEmailTranslator(locale);
  const id = order.display_id ?? order.id;
  const customerName = [
    order.shipping_address?.first_name,
    order.shipping_address?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const ordersUrl = `${STOREFRONT_URL}/account/orders`;
  const city = order.shipping_address?.city;
  const trackingNumbers = fulfillment?.tracking_numbers ?? [];
  const trackingLinks = fulfillment?.tracking_links ?? [];
  const hasTracking = trackingNumbers.length > 0 || trackingLinks.length > 0;

  return (
    <EmailLayout preview={t("Fulfillment.preview", { id })} locale={locale}>
      <Heading style={s.heading}>
        {customerName
          ? t("Fulfillment.headingWithName", { name: customerName })
          : t("Fulfillment.headingAnon")}
      </Heading>

      <Text
        style={s.paragraph}
        dangerouslySetInnerHTML={{
          __html: [
            html("Fulfillment.bodyOrder", { id }),
            city ? html("Fulfillment.deliveryCity", { city }) : "",
          ]
            .filter(Boolean)
            .join(" "),
        }}
      />

      {hasTracking && (
        <Section style={s.card}>
          <Text style={s.cardTitle}>{t("Fulfillment.trackingTitle")}</Text>

          {trackingLinks.length > 0
            ? trackingLinks.map((tl, i) => (
                <Row key={i} style={s.trackRow}>
                  <Column>
                    <Text style={s.trackLabel}>{t("Fulfillment.trackLabel")}</Text>
                    {tl.url ? (
                      <a href={tl.url} style={s.trackLink}>
                        {tl.tracking_number || tl.url}
                      </a>
                    ) : (
                      <Text style={s.trackValue}>{tl.tracking_number}</Text>
                    )}
                  </Column>
                </Row>
              ))
            : trackingNumbers.map((number, i) => (
                <Row key={i} style={s.trackRow}>
                  <Column>
                    <Text style={s.trackLabel}>{t("Fulfillment.trackLabel")}</Text>
                    <Text style={s.trackValue}>{number}</Text>
                  </Column>
                </Row>
              ))}
        </Section>
      )}

      {!hasTracking && (
        <Section style={s.card}>
          <Text style={{ ...s.paragraph, margin: 0 }}>
            {t("Fulfillment.noTracking")}
          </Text>
        </Section>
      )}

      <Text style={s.paragraph}>{t("Fulfillment.deliveryTime")}</Text>

      <Section style={s.buttonSection}>
        <Button href={ordersUrl} style={s.button}>
          {t("Common.trackOrder")}
        </Button>
      </Section>

      <Text style={s.footerNote}>
        {t("Common.questionsPrefix")}{" "}
        <a href={`mailto:${STORE_EMAIL}`} style={s.link}>
          {STORE_EMAIL}
        </a>
        {STORE_PHONE ? (
          <>
            {" "}
            {t("Common.orCall")}{" "}
            <a href={`tel:${STORE_PHONE.replace(/\s/g, "")}`} style={s.link}>
              {STORE_PHONE}
            </a>
          </>
        ) : null}
      </Text>
    </EmailLayout>
  );
}

export default OrderFulfillmentCreatedEmail;

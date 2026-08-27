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
      <Heading style={heading}>
        {customerName
          ? t("Fulfillment.headingWithName", { name: customerName })
          : t("Fulfillment.headingAnon")}
      </Heading>

      <Text
        style={paragraph}
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
        <Section style={card}>
          <Text style={cardTitle}>{t("Fulfillment.trackingTitle")}</Text>

          {trackingLinks.length > 0
            ? trackingLinks.map((tl, i) => (
                <Row key={i} style={trackRow}>
                  <Column>
                    <Text style={trackLabel}>{t("Fulfillment.trackLabel")}</Text>
                    {tl.url ? (
                      <a href={tl.url} style={trackLink}>
                        {tl.tracking_number || tl.url}
                      </a>
                    ) : (
                      <Text style={trackValue}>{tl.tracking_number}</Text>
                    )}
                  </Column>
                </Row>
              ))
            : trackingNumbers.map((number, i) => (
                <Row key={i} style={trackRow}>
                  <Column>
                    <Text style={trackLabel}>{t("Fulfillment.trackLabel")}</Text>
                    <Text style={trackValue}>{number}</Text>
                  </Column>
                </Row>
              ))}
        </Section>
      )}

      {!hasTracking && (
        <Section style={card}>
          <Text style={{ ...paragraph, margin: 0 }}>
            {t("Fulfillment.noTracking")}
          </Text>
        </Section>
      )}

      <Text style={paragraph}>{t("Fulfillment.deliveryTime")}</Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={ordersUrl} style={button}>
          {t("Common.trackOrder")}
        </Button>
      </Section>

      <Text style={footer}>
        {t("Common.questionsPrefix")}{" "}
        <a href={`mailto:${STORE_EMAIL}`} style={link}>
          {STORE_EMAIL}
        </a>
        {STORE_PHONE ? (
          <>
            {" "}
            {t("Common.orCall")}{" "}
            <a href={`tel:${STORE_PHONE.replace(/\s/g, "")}`} style={link}>
              {STORE_PHONE}
            </a>
          </>
        ) : null}
      </Text>
    </EmailLayout>
  );
}

export default OrderFulfillmentCreatedEmail;

const heading: React.CSSProperties = {
  margin: "0 0 16px",
  fontFamily: "Arial, sans-serif",
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 16px",
  fontFamily: "Arial, sans-serif",
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#1f2937",
};

const card: React.CSSProperties = {
  margin: "16px 0",
  padding: "16px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  backgroundColor: "#fafafa",
};

const cardTitle: React.CSSProperties = {
  margin: "0 0 12px",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const trackRow: React.CSSProperties = {
  marginBottom: "8px",
};

const trackLabel: React.CSSProperties = {
  margin: "0",
  fontFamily: "Arial, sans-serif",
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const trackValue: React.CSSProperties = {
  margin: "2px 0 0",
  fontFamily: "Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "600",
  color: "#111827",
};

const trackLink: React.CSSProperties = {
  display: "block",
  marginTop: "2px",
  fontFamily: "Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "600",
  color: "#18181b",
};

const button: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 24px",
  borderRadius: "8px",
  backgroundColor: "#18181b",
  color: "#ffffff",
  textDecoration: "none",
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  fontWeight: "700",
};

const footer: React.CSSProperties = {
  margin: "16px 0 0",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  color: "#6b7280",
};

const link: React.CSSProperties = {
  color: "#18181b",
};

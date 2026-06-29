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
import { type EmailLang, emailTranslations } from "./i18n";

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
  lang?: EmailLang;
};

const storefrontUrl = (
  process.env.STOREFRONT_URL || "https://rustarter.example"
).replace(/\/$/, "");
const countryCode = process.env.STOREFRONT_DEFAULT_COUNTRY || "ru";

export function OrderFulfillmentCreatedEmail({
  order,
  fulfillment,
  lang = "ru",
}: OrderFulfillmentCreatedEmailProps) {
  const s = emailTranslations[lang];
  const orderId = order.display_id ?? order.id;
  const customerName = [
    order.shipping_address?.first_name,
    order.shipping_address?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const ordersUrl = `${storefrontUrl}/${countryCode}/account/orders`;
  const trackingNumbers = fulfillment?.tracking_numbers ?? [];
  const trackingLinks = fulfillment?.tracking_links ?? [];
  const hasTracking = trackingNumbers.length > 0 || trackingLinks.length > 0;

  return (
    <EmailLayout preview={s.fulfillment.preview(orderId)} lang={lang}>
      <Heading style={heading}>
        {customerName
          ? s.fulfillment.headingWithName(customerName)
          : s.fulfillment.headingAnon}
      </Heading>

      <Text
        style={paragraph}
        dangerouslySetInnerHTML={{
          __html:
            s.fulfillment.bodyOrder(orderId) +
            (order.shipping_address?.city
              ? s.fulfillment.deliveryCity(order.shipping_address.city)
              : ""),
        }}
      />

      {hasTracking && (
        <Section style={card}>
          <Text style={cardTitle}>{s.fulfillment.trackingTitle}</Text>

          {trackingLinks.length > 0
            ? trackingLinks.map((tl, i) => (
                <Row key={i} style={trackRow}>
                  <Column>
                    <Text style={trackLabel}>{s.fulfillment.trackLabel}</Text>
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
                    <Text style={trackLabel}>{s.fulfillment.trackLabel}</Text>
                    <Text style={trackValue}>{number}</Text>
                  </Column>
                </Row>
              ))}
        </Section>
      )}

      {!hasTracking && (
        <Section style={card}>
          <Text style={{ ...paragraph, margin: 0 }}>
            {s.fulfillment.noTracking}
          </Text>
        </Section>
      )}

      <Text style={paragraph}>{s.fulfillment.deliveryTime}</Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={ordersUrl} style={button}>
          {s.common.trackOrder}
        </Button>
      </Section>

      <Text style={footer}>
        {s.common.questionsPrefix}{" "}
        <a
          href={`mailto:${process.env.STORE_EMAIL || "demo@gorgojs.com"}`}
          style={link}
        >
          {process.env.STORE_EMAIL || "demo@gorgojs.com"}
        </a>
        {process.env.STORE_PHONE && (
          <>
            {" "}
            {s.common.orCall}{" "}
            <a
              href={`tel:${process.env.STORE_PHONE.replace(/\s/g, "")}`}
              style={link}
            >
              {process.env.STORE_PHONE}
            </a>
          </>
        )}
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

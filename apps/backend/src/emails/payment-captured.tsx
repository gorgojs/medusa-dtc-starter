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

export type PaymentCapturedEmailProps = {
  order: {
    id: string;
    display_id?: number | string;
    email?: string;
    items?: Array<{
      title?: string;
      quantity?: number;
      unit_price?: number;
    }>;
    currency_code?: string;
    total?: number;
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      city?: string;
    };
  };
  lang?: EmailLang;
};

const storefrontUrl = (
  process.env.STOREFRONT_URL || "https://rustarter.example"
).replace(/\/$/, "");
const countryCode = process.env.STOREFRONT_DEFAULT_COUNTRY || "ru";

export function PaymentCapturedEmail({
  order,
  lang = "ru",
}: PaymentCapturedEmailProps) {
  const s = emailTranslations[lang];
  const orderId = order.display_id ?? order.id;
  const customerName = [
    order.shipping_address?.first_name,
    order.shipping_address?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const ordersUrl = `${storefrontUrl}/${countryCode}/account/orders`;
  const currencyCode = (order.currency_code || "RUB").toUpperCase();
  const locale = lang === "ru" ? "ru-RU" : "en-US";
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${currencyCode}`;

  return (
    <EmailLayout preview={s.payment.preview(orderId)} lang={lang}>
      <Heading style={heading}>
        {customerName
          ? s.payment.headingWithName(customerName)
          : s.payment.headingAnon}
      </Heading>

      <Text
        style={paragraph}
        dangerouslySetInnerHTML={{ __html: s.payment.bodyOrder(orderId) }}
      />

      {order.items && order.items.length > 0 && (
        <Section style={card}>
          <Text style={cardTitle}>{s.common.orderSummary}</Text>
          {order.items.map((item, i) => (
            <Row key={i} style={itemRow}>
              <Column style={itemName}>
                {item.title || s.common.item} × {item.quantity ?? 1}
              </Column>
              <Column style={itemPrice}>
                {item.unit_price != null
                  ? formatAmount(item.unit_price * (item.quantity ?? 1))
                  : "—"}
              </Column>
            </Row>
          ))}
          {order.total != null && (
            <Row style={totalRow}>
              <Column style={totalLabel}>{s.common.total}</Column>
              <Column style={totalAmount}>{formatAmount(order.total)}</Column>
            </Row>
          )}
        </Section>
      )}

      <Text style={paragraph}>{s.payment.watchStatus}</Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={ordersUrl} style={button}>
          {s.common.myOrders}
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
      </Text>
    </EmailLayout>
  );
}

export default PaymentCapturedEmail;

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
  border: "1px solid #d1fae5",
  borderRadius: "10px",
  backgroundColor: "#f0fdf4",
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

const itemRow: React.CSSProperties = {
  borderBottom: "1px solid #d1fae5",
  paddingBottom: "8px",
  marginBottom: "8px",
};

const itemName: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  color: "#1f2937",
};

const itemPrice: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  color: "#1f2937",
  textAlign: "right" as const,
};

const totalRow: React.CSSProperties = {
  marginTop: "8px",
};

const totalLabel: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "700",
  color: "#111827",
};

const totalAmount: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "700",
  color: "#111827",
  textAlign: "right" as const,
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

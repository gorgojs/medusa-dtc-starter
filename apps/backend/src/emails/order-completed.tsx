import {
  Button,
  Column,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import { type NumericValue, toNumber } from "./numeric";
import {
  type EmailLocale,
  DEFAULT_EMAIL_LOCALE,
  getEmailTranslator,
  STOREFRONT_URL,
  STORE_EMAIL,
} from "./i18n";

export type OrderCompletedEmailProps = {
  order: {
    id: string;
    display_id?: number | string;
    email?: string;
    currency_code?: string;
    total?: NumericValue;
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      city?: string;
    };
    items?: Array<{
      title?: string;
      quantity?: NumericValue;
      unit_price?: NumericValue;
    }>;
  };
  locale?: EmailLocale;
};

export function OrderCompletedEmail({
  order,
  locale = DEFAULT_EMAIL_LOCALE,
}: OrderCompletedEmailProps) {
  const { t, html, money } = getEmailTranslator(locale);
  const id = order.display_id ?? order.id;
  const customerName = [
    order.shipping_address?.first_name,
    order.shipping_address?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const ordersUrl = `${STOREFRONT_URL}/account/orders`;
  const city = order.shipping_address?.city;
  const formatAmount = (amount: NumericValue) =>
    money(toNumber(amount), order.currency_code);

  return (
    <EmailLayout preview={t("OrderCompleted.preview", { id })} locale={locale}>
      <Heading style={heading}>
        {customerName
          ? t("OrderCompleted.headingWithName", { name: customerName })
          : t("OrderCompleted.headingAnon")}
      </Heading>

      <Text
        style={paragraph}
        dangerouslySetInnerHTML={{
          __html: [
            html("OrderCompleted.bodyOrder", { id }),
            city ? html("OrderCompleted.deliveryCity", { city }) : "",
          ]
            .filter(Boolean)
            .join(" "),
        }}
      />

      {order.items && order.items.length > 0 && (
        <Section style={card}>
          <Text style={cardTitle}>{t("Common.orderSummary")}</Text>
          {order.items.map((item, i) => (
            <Row key={i} style={itemRow}>
              <Column style={itemName}>
                {item.title || t("Common.item")} × {toNumber(item.quantity, 1)}
              </Column>
              <Column style={itemPrice}>
                {item.unit_price != null
                  ? formatAmount(
                      toNumber(item.unit_price) * toNumber(item.quantity, 1),
                    )
                  : "—"}
              </Column>
            </Row>
          ))}
          {order.total != null && (
            <Row style={totalRow}>
              <Column style={totalLabel}>{t("Common.total")}</Column>
              <Column style={totalAmount}>{formatAmount(order.total)}</Column>
            </Row>
          )}
        </Section>
      )}

      <Text style={paragraph}>{t("OrderCompleted.bodyPromo")}</Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={ordersUrl} style={button}>
          {t("Common.myOrders")}
        </Button>
      </Section>

      <Text style={footer}>
        {t("Common.questionsPrefix")}{" "}
        <a href={`mailto:${STORE_EMAIL}`} style={link}>
          {STORE_EMAIL}
        </a>
      </Text>
    </EmailLayout>
  );
}

export default OrderCompletedEmail;

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

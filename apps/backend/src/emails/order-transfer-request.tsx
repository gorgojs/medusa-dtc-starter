import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import { type EmailLang, emailTranslations } from "./i18n";

export type OrderTransferRequestEmailProps = {
  displayId: string | number;
  transferUrl: string;
  lang?: EmailLang;
};

export function OrderTransferRequestEmail({
  displayId,
  transferUrl,
  lang = "ru",
}: OrderTransferRequestEmailProps) {
  const s = emailTranslations[lang];
  return (
    <EmailLayout preview={s.orderTransfer.preview(displayId)} lang={lang}>
      <Heading style={heading}>{s.orderTransfer.heading}</Heading>

      <Text
        style={paragraph}
        dangerouslySetInnerHTML={{ __html: s.orderTransfer.body(displayId) }}
      />

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={transferUrl} style={button}>
          {s.orderTransfer.button}
        </Button>
      </Section>

      <Text
        style={hint}
        dangerouslySetInnerHTML={{ __html: s.orderTransfer.hint }}
      />

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

export default OrderTransferRequestEmail;

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

const hint: React.CSSProperties = {
  margin: "0 0 16px",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#6b7280",
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

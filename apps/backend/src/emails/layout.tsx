import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import {
  type EmailLocale,
  DEFAULT_EMAIL_LOCALE,
  getEmailTranslator,
  STORE_ADDRESS,
  STORE_EMAIL,
  STORE_NAME,
  STORE_PHONE,
} from "./i18n";

type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
  locale?: EmailLocale;
};

export function EmailLayout({
  preview,
  children,
  locale = DEFAULT_EMAIL_LOCALE,
}: EmailLayoutProps) {
  const { t, dir } = getEmailTranslator(locale);
  const contactLine = [STORE_ADDRESS, STORE_EMAIL, STORE_PHONE]
    .filter(Boolean)
    .join(" · ");

  return (
    <Html lang={locale} dir={dir}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={{ ...container, direction: dir }}>
          <Section style={header}>
            <Text style={brand}>{STORE_NAME}</Text>
          </Section>

          <Section style={content}>{children}</Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              {t("Layout.copyright", { year: new Date().getFullYear() })}
            </Text>
            <Text style={footerText}>{contactLine}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  margin: 0,
  padding: "24px",
  backgroundColor: "#f4f5f7",
  fontFamily: "Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "640px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  padding: "24px 24px 16px",
  background: "linear-gradient(180deg,#f3fffc 0%,#ffffff 100%)",
  borderBottom: "1px solid #e5e7eb",
};

const brand: React.CSSProperties = {
  margin: 0,
  fontFamily: "Arial, sans-serif",
  color: "#18181b",
  fontSize: "18px",
  fontWeight: "700",
  letterSpacing: "0.1em",
};

const content: React.CSSProperties = {
  padding: "24px",
  fontFamily: "Arial, sans-serif",
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "1.7",
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const footer: React.CSSProperties = {
  padding: "16px 24px",
};

const footerText: React.CSSProperties = {
  margin: "0 0 4px",
  fontFamily: "Arial, sans-serif",
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.5",
};

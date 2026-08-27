import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import {
  type EmailLocale,
  DEFAULT_EMAIL_LOCALE,
  getEmailTranslator,
  STORE_EMAIL,
} from "./i18n";

export type WelcomeEmailProps = {
  firstName?: string | null;
  shopUrl: string;
  locale?: EmailLocale;
};

export function WelcomeEmail({
  firstName,
  shopUrl,
  locale = DEFAULT_EMAIL_LOCALE,
}: WelcomeEmailProps) {
  const { t } = getEmailTranslator(locale);

  return (
    <EmailLayout preview={t("Welcome.preview")} locale={locale}>
      <Heading style={heading}>
        {firstName
          ? t("Welcome.headingWithName", { name: firstName })
          : t("Welcome.headingAnon")}
      </Heading>

      <Text style={paragraph}>{t("Welcome.body")}</Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={shopUrl} style={button}>
          {t("Welcome.button")}
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

export default WelcomeEmail;

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

const footer: React.CSSProperties = {
  margin: "16px 0 0",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  color: "#6b7280",
};

const link: React.CSSProperties = {
  color: "#18181b",
};

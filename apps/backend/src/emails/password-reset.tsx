import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import {
  type EmailLocale,
  DEFAULT_EMAIL_LOCALE,
  getEmailTranslator,
  STORE_EMAIL,
} from "./i18n";

export type PasswordResetEmailProps = {
  email: string;
  token: string;
  resetUrl: string;
  locale?: EmailLocale;
};

export function PasswordResetEmail({
  email,
  resetUrl,
  locale = DEFAULT_EMAIL_LOCALE,
}: PasswordResetEmailProps) {
  const { t, html } = getEmailTranslator(locale);

  return (
    <EmailLayout preview={t("PasswordReset.preview")} locale={locale}>
      <Heading style={heading}>{t("PasswordReset.heading")}</Heading>

      <Text
        style={paragraph}
        dangerouslySetInnerHTML={{
          __html: html("PasswordReset.body", { email }),
        }}
      />

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={resetUrl} style={button}>
          {t("PasswordReset.button")}
        </Button>
      </Section>

      <Text
        style={hint}
        dangerouslySetInnerHTML={{ __html: html("PasswordReset.hint") }}
      />

      <Text style={footer}>
        {t("Common.questionsPrefix")}{" "}
        <a href={`mailto:${STORE_EMAIL}`} style={link}>
          {STORE_EMAIL}
        </a>
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;

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

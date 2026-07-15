import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import { type EmailLang, emailTranslations } from "./i18n";

export type WelcomeEmailProps = {
  firstName?: string | null;
  shopUrl: string;
  lang?: EmailLang;
};

export function WelcomeEmail({
  firstName,
  shopUrl,
  lang = "ru",
}: WelcomeEmailProps) {
  const s = emailTranslations[lang];
  return (
    <EmailLayout preview={s.welcome.preview} lang={lang}>
      <Heading style={heading}>
        {firstName
          ? s.welcome.headingWithName(firstName)
          : s.welcome.headingAnon}
      </Heading>

      <Text style={paragraph}>{s.welcome.body}</Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={shopUrl} style={button}>
          {s.welcome.button}
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

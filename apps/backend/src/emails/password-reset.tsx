import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

export type PasswordResetEmailProps = {
  email: string;
  token: string;
  resetUrl: string;
};

export function PasswordResetEmail({
  email,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Сброс пароля — ссылка действительна 15 минут">
      <Heading style={heading}>Сброс пароля</Heading>

      <Text style={paragraph}>
        Мы получили запрос на сброс пароля для аккаунта{" "}
        <strong>{email}</strong>. Нажмите кнопку ниже, чтобы задать новый
        пароль.
      </Text>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Button href={resetUrl} style={button}>
          Сбросить пароль
        </Button>
      </Section>

      <Text style={hint}>
        Ссылка действительна в течение <strong>15 минут</strong>. Если вы не
        запрашивали сброс пароля — просто проигнорируйте это письмо.
      </Text>

      <Text style={footer}>
        Возникли вопросы? Напишите нам на{" "}
        <a href="mailto:info@rustarter.example" style={link}>
          info@rustarter.example
        </a>
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;

// Styles
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

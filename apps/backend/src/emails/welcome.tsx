import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";
import * as s from "./lib/styles";
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
      <Heading style={s.heading}>
        {firstName
          ? t("Welcome.headingWithName", { name: firstName })
          : t("Welcome.headingAnon")}
      </Heading>

      <Text style={s.paragraph}>{t("Welcome.body")}</Text>

      <Section style={s.buttonSection}>
        <Button href={shopUrl} style={s.button}>
          {t("Welcome.button")}
        </Button>
      </Section>

      <Text style={s.footerNote}>
        {t("Common.questionsPrefix")}{" "}
        <a href={`mailto:${STORE_EMAIL}`} style={s.link}>
          {STORE_EMAIL}
        </a>
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;

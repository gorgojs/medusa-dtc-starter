import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">{t("title")}</h1>
      <p className="text-small-regular text-ui-fg-base">
        {t("description")}
      </p>
      <InteractiveLink href="/">{t("goHome")}</InteractiveLink>
    </div>
  )
}

import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import ResetPassword from "@modules/account/components/reset-password"
import { pageTitle } from "@lib/util/page-title"

type Props = {
  searchParams: Promise<{ token?: string; email?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.resetPassword")

  return {
    title: pageTitle(t("title")),
    description: t("description"),
    // The link carries a single-use token, so keep it out of search results.
    robots: { index: false, follow: false },
  }
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, email } = await searchParams

  return (
    <div className="w-full flex justify-center px-8 py-12">
      <ResetPassword token={token ?? ""} email={email} />
    </div>
  )
}

import { Heading, Text } from "@modules/common/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"
import { getTranslations } from "next-intl/server"

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>
}) {
  const { id, token } = await params
  const t = await getTranslations("TransferPage")

  return (
    <div className="flex flex-col gap-y-6 items-start w-full max-w-xl mx-auto px-4 py-12 md:py-16">
      <TransferImage />
      <div className="flex flex-col gap-y-5 w-full min-w-0">
        <Heading level="h1" className="!text-xl text-zinc-900 break-words">
          {t("requestHeading", { id })}
        </Heading>
        <Text className="!text-sm text-zinc-600 break-words">
          {t("requestIntro", { id })}
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <Text className="!text-sm text-zinc-600">{t("acceptInfo")}</Text>
        <Text className="!text-sm text-zinc-600">{t("noAction")}</Text>
        <div className="w-full h-px bg-zinc-200" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}

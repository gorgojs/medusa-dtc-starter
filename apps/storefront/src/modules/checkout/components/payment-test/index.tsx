import { Badge } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

const PaymentTest = async ({ className }: { className?: string }) => {
  const t = await getTranslations("PaymentTest")

  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">{t("attention")}</span> {t("testingOnly")}
    </Badge>
  )
}

export default PaymentTest

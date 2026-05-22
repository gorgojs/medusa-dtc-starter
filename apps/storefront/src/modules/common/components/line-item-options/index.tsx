import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = async ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const t = await getTranslations("LineItemOptions")

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      {t("variant")} {variant?.title}
    </Text>
  )
}

export default LineItemOptions

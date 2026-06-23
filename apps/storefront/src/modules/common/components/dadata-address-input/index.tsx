"use client"

import { useState, useId } from "react"
import type { DaDataSuggestion, DaDataAddress } from "react-dadata"
import { AddressSuggestions } from "react-dadata"
import "react-dadata/dist/react-dadata.css"
import Input from "@modules/common/components/input"
import { useTranslations } from "next-intl"

export type AddressFields = {
  address_1: string
  postal_code: string
  city: string
  province: string
}

type Props = {
  namePrefix?: string
  values: AddressFields
  onChange: (fields: AddressFields) => void
  required?: boolean
}

function buildAddressLine(d: DaDataAddress): string {
  return [
    d.street_with_type,
    d.house ? `д. ${d.house}` : null,
    d.block ? `${d.block_type || "корп."} ${d.block}` : null,
    d.flat ? `кв. ${d.flat}` : null,
  ]
    .filter(Boolean)
    .join(", ")
}

export default function DaDataAddressInput({
  namePrefix,
  values,
  onChange,
  required,
}: Props) {
  const t = useTranslations("CheckoutPage")
  const [manualMode, setManualMode] = useState(false)
  const [suggestion, setSuggestion] = useState<
    DaDataSuggestion<DaDataAddress> | undefined
  >()
  const uid = useId()

  const token = process.env.NEXT_PUBLIC_DADATA_API_KEY || ""

  const fieldName = (field: string) =>
    namePrefix ? `${namePrefix}.${field}` : field

  const handleSuggestionChange = (
    s: DaDataSuggestion<DaDataAddress> | undefined
  ) => {
    if (!s) return
    setSuggestion(s)
    const d = s.data
    onChange({
      address_1: buildAddressLine(d) || s.value,
      postal_code: d.postal_code || "",
      city: d.city || d.settlement || d.area || "",
      province: d.region_with_type || d.region || "",
    })
  }

  const handleInputTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, address_1: e.target.value })
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.name
    const field = namePrefix ? raw.replace(`${namePrefix}.`, "") : raw
    onChange({ ...values, [field]: e.target.value })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <label className="flex items-center gap-x-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={manualMode}
          onChange={(e) => setManualMode(e.target.checked)}
          className="w-4 h-4 rounded border-ui-border-base accent-ui-fg-interactive"
        />
        <span className="txt-compact-small text-ui-fg-subtle select-none">
          {t("manualInput")}
        </span>
      </label>

      {manualMode ? (
        <>
          <Input
            label={t("fieldAddress")}
            name={fieldName("address_1")}
            autoComplete="address-line1"
            value={values.address_1}
            onChange={handleManualChange}
            required={required}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("fieldPostalCode")}
              name={fieldName("postal_code")}
              autoComplete="postal-code"
              value={values.postal_code}
              onChange={handleManualChange}
              required={required}
            />
            <Input
              label={t("fieldCity")}
              name={fieldName("city")}
              autoComplete="address-level2"
              value={values.city}
              onChange={handleManualChange}
              required={required}
            />
          </div>
          <Input
            label={t("fieldProvince")}
            name={fieldName("province")}
            autoComplete="address-level1"
            value={values.province}
            onChange={handleManualChange}
          />
        </>
      ) : (
        <>
          {/* Hidden inputs capture all address fields in FormData on submit */}
          <input
            type="hidden"
            name={fieldName("address_1")}
            value={values.address_1}
          />
          <input
            type="hidden"
            name={fieldName("postal_code")}
            value={values.postal_code}
          />
          <input
            type="hidden"
            name={fieldName("city")}
            value={values.city}
          />
          <input
            type="hidden"
            name={fieldName("province")}
            value={values.province}
          />

          <div className="flex flex-col w-full gap-y-1">
            <span className="txt-compact-small text-ui-fg-subtle px-1">
              {t("fieldAddress")}
              {required && <span className="text-rose-500">*</span>}
            </span>
            <AddressSuggestions
              token={token}
              value={suggestion}
              defaultQuery={values.address_1}
              onChange={handleSuggestionChange}
              uid={uid}
              delay={300}
              inputProps={{
                className:
                  "block w-full h-11 px-4 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 border-ui-border-base hover:bg-ui-bg-field-hover txt-compact-medium",
                autoComplete: "off",
                onChange: handleInputTyping,
              }}
              containerClassName="react-dadata-container relative w-full"
            />
          </div>

          {(values.postal_code || values.city || values.province) && (
            <div className="flex flex-col gap-y-1 px-1 text-ui-fg-subtle txt-compact-xsmall">
              {(values.postal_code || values.city) && (
                <div className="flex gap-x-4">
                  {values.postal_code && (
                    <span>
                      <span className="text-ui-fg-muted">
                        {t("fieldPostalCode")}:{" "}
                      </span>
                      {values.postal_code}
                    </span>
                  )}
                  {values.city && (
                    <span>
                      <span className="text-ui-fg-muted">
                        {t("fieldCity")}:{" "}
                      </span>
                      {values.city}
                    </span>
                  )}
                </div>
              )}
              {values.province && (
                <span>
                  <span className="text-ui-fg-muted">
                    {t("fieldProvince")}:{" "}
                  </span>
                  {values.province}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

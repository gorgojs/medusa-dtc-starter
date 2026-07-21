"use client"

import type React from "react"
import Input from "@modules/common/components/input"
import { useTranslations } from "next-intl"
import type { AddressAutocompleteProps } from "./types"

const ManualAddressFields = ({
  namePrefix,
  values,
  onChange,
  required,
}: AddressAutocompleteProps) => {
  const t = useTranslations("CheckoutPage")

  const fieldName = (field: string) =>
    namePrefix ? `${namePrefix}.${field}` : field

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.name
    const field = namePrefix ? raw.replace(`${namePrefix}.`, "") : raw
    onChange({ ...values, [field]: e.target.value })
  }

  return (
    <>
      <Input
        label={t("fieldAddress")}
        name={fieldName("address_1")}
        autoComplete="address-line1"
        value={values.address_1}
        onChange={handleChange}
        required={required}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("fieldPostalCode")}
          name={fieldName("postal_code")}
          autoComplete="postal-code"
          value={values.postal_code}
          onChange={handleChange}
          required={required}
        />
        <Input
          label={t("fieldCity")}
          name={fieldName("city")}
          autoComplete="address-level2"
          value={values.city}
          onChange={handleChange}
          required={required}
        />
      </div>
      <Input
        label={t("fieldProvince")}
        name={fieldName("province")}
        autoComplete="address-level1"
        value={values.province}
        onChange={handleChange}
      />
    </>
  )
}

export default ManualAddressFields

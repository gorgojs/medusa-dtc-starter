export type AddressFields = {
  address_1: string
  postal_code: string
  city: string
  province: string
}

export type AddressAutocompleteProps = {
  namePrefix?: string
  values: AddressFields
  onChange: (fields: AddressFields) => void
  required?: boolean
}

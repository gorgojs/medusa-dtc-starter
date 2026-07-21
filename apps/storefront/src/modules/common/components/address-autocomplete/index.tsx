"use client"

import { addressAutocompleteProvider, isDaData } from "@lib/constants"
import DaDataAddressInput from "./providers/dadata"
import ManualAddressFields from "./manual-address-fields"
import type { AddressAutocompleteProps } from "./types"

export type { AddressFields } from "./types"

const AddressAutocomplete = (props: AddressAutocompleteProps) => {
  switch (true) {
    case isDaData(addressAutocompleteProvider):
      return <DaDataAddressInput {...props} />
    default:
      return (
        <div className="flex flex-col gap-y-3">
          <ManualAddressFields {...props} />
        </div>
      )
  }
}

export default AddressAutocomplete

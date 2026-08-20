"use client"

import ReactCountryFlag from "react-country-flag"

const CDN_URL = "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.5.0/flags/4x3/"

type CountryFlagProps = {
  countryCode: string
  className?: string
  style?: React.CSSProperties
}

export default function CountryFlag({
  countryCode,
  className,
  style,
}: CountryFlagProps) {
  return (
    <ReactCountryFlag
      svg
      alt=""
      cdnUrl={CDN_URL}
      countryCode={countryCode}
      className={className}
      style={style}
    />
  )
}

"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import type React from "react"

const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: unknown
}) => {
  const locale = useLocale()

  return (
    <Link href={`/${locale}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink

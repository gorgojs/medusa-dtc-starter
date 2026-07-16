import { User, BarsThree } from "@medusajs/icons"
import Image from "next/image"
import { Link } from "@i18n/navigation"

import Search from "@modules/layout/components/search"
import CartButton from "@modules/layout/components/cart-button"

const BottomNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-2 right-2 z-40 flex h-16 items-stretch rounded-t-xl border-x border-t border-ui-border-base bg-ui-bg-base">
      <div className="flex flex-1 items-center justify-center text-ui-fg-subtle">
        <BarsThree />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Search className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors" />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Link href="/" aria-label="Gorgo">
          <Image src="/gorgo.svg" alt="Gorgo" width={24} height={26} priority />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center text-ui-fg-subtle hover:text-ui-fg-base transition-colors">
        <Link href="/account" aria-label="Account">
          <User />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <CartButton />
      </div>
    </nav>
  )
}

export default BottomNav

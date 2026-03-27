import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { useLocation } from "react-router-dom"
import { retrieveClient } from "@lib/data/client"
import { retrieveDeveloper } from "@lib/data/developer"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  const developer = await retrieveDeveloper().catch(() => null)
  const client = await retrieveClient().catch(() => null)

  const isLoggedIn = Boolean(developer || client)
  const isDeveloper = Boolean(developer)

  let marketplaceLink = "/marketplace/bugs";

  if (isDeveloper) {
    marketplaceLink = "/developer/account/bug-marketplace";
  }

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              BugZapper Marketplace
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            {!isLoggedIn && (
              <>
                <div className="hidden small:flex items-center gap-x-6 h-full">
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/client/account"
                    data-testid="nav-account-link"
                  >
                    For Clients
                  </LocalizedClientLink>
                </div>
                <div className="hidden small:flex items-center gap-x-6 h-full">
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/developer/account"
                    data-testid="nav-account-link"
                  >
                    For Developers
                  </LocalizedClientLink>
                </div>
              </>
            )}
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href={marketplaceLink}
                data-testid="nav-account-link"
              >
                Marketplace
              </LocalizedClientLink>
            </div>
            {/* <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense> */}
          </div>
        </nav>
      </header>
    </div>
  )
}

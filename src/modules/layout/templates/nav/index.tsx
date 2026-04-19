import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"
import { retrieveClient } from "@lib/data/client"
import { retrieveDeveloper } from "@lib/data/developer"
import ProfileDropdownWrapper from "@modules/layout/components/profile-dropdown/logout-wrapper"
import {
  ClientNotificationBell,
  DeveloperNotificationBell,
} from "@modules/layout/components/notification-bell/notification-bell-wrapper"
import GlobalMessageIcon from "@modules/messaging/components/global-message-icon"
import { getActorType } from "@modules/common/functions/get-actor-type"

export default async function Nav() {
  const actorType: "client" | "developer" | null = await getActorType()

  let displayName = "User"
  let avatarUrl = ""

  if (actorType === "developer") {
    const developerData = await retrieveDeveloper().catch(() => null)
    displayName = developerData?.developer.first_name || "Developer"
    avatarUrl = developerData?.developer.avatar_url || ""
  } else if (actorType === "client") {
    const clientData = await retrieveClient().catch(() => null)
    displayName = clientData?.client.contact_first_name || "Client"
    avatarUrl = clientData?.client.avatar_url || ""
  }

  const isLoggedIn = Boolean(actorType)
  const isDeveloper = actorType === "developer"

  // const displayName =
  //   developerData?.developer.first_name ||
  //   clientData?.client.contact_first_name ||
  //   "User"

  let marketplaceLink = "/marketplace/bugs"

  if (isLoggedIn) {
    if (isDeveloper) {
      marketplaceLink = "/developer/account/bug-marketplace?status=open"
    } else {
      marketplaceLink = "/client/account/bug-marketplace"
    }
  }

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              {/* <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} /> */}
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
            {isLoggedIn && (
              <div className="flex items-center gap-x-4">
                <GlobalMessageIcon
                  currentUserType={isDeveloper ? "developer" : "client"}
                />
                {isDeveloper ? (
                  <DeveloperNotificationBell />
                ) : (
                  <ClientNotificationBell />
                )}
                <ProfileDropdownWrapper
                  name={displayName}
                  avatarUrl={avatarUrl}
                  profileHref={
                    isDeveloper
                      ? "/developer/account/profile"
                      : "/client/account/profile"
                  }
                />
              </div>
            )}
          </div>
        </nav>
      </header>
    </div>
  )
}

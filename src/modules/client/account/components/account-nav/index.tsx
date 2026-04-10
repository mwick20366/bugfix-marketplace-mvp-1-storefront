"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { usePathname } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useClientMe } from "@lib/hooks/use-client-me"
import { Client, signoutClient } from "@lib/data/client"

const AccountNav = () => {
  const route = usePathname()

  const handleLogout = async () => {
    await signoutClient()
  }

  const { clientData } = useClientMe()
  const { client } = clientData || {}

  const developerSubmissions = client?.bugs?.flatMap((bug) => bug.submissions) || []

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/client/account` ? (
          <LocalizedClientLink
            href="/client/account"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>Account</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              Hello {client?.first_name || "there"}!
            </div>
            <div className="text-base-regular">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/client/account/my-bugs"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>My Bugs ({client?.bugs?.length || 0})</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/client/account/developer-submissions"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>Developer Submissions ({developerSubmissions.length})</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>                
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>Log out!</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div>
          <div className="pb-4">
            <h3 className="text-base-semi">Account</h3>
          </div>
          <div className="text-base-regular">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
              <li>
                <AccountNavLink
                  href="/client/account"
                  route={route!}
                  data-testid="overview-link"
                >
                  Overview
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/client/account/my-bugs"
                  route={route!}
                  data-testid="profile-link"
                >
                  My Bugs ({client?.bugs?.length || 0 })
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/client/account/developer-submissions"
                  route={route!}
                  data-testid="profile-link"
                >
                  Developer Submissions ({developerSubmissions?.length || 0 })
                </AccountNavLink>
              </li>              
              <li className="text-grey-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const active = route === href
  
  return (
    <LocalizedClientLink
      href={href}
      className={clx("text-ui-fg-subtle hover:text-ui-fg-base", {
        "text-ui-fg-base font-semibold": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav

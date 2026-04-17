import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getActorType } from "@modules/common/functions/get-actor-type"
import BugzapperCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const actorType: "client" | "developer" | null = await getActorType()

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 xsmall:flex-row items-start justify-between py-12">
          {/* Brand */}
          <div className="flex flex-col gap-y-3 max-w-xs">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-base hover:text-ui-fg-subtle uppercase"
            >
              Bugzapper
            </LocalizedClientLink>
            <Text className="txt-small text-ui-fg-muted">
              A marketplace connecting clients with developers to squash bugs and ship fixes fast.
            </Text>
          </div>

          {/* Links grid */}
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {/* Marketplace */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-ui-fg-base">Marketplace</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    href={`/${actorType}/account/bug-marketplace`}
                    className="hover:text-ui-fg-base"
                  >
                    Browse Bugs
                  </LocalizedClientLink>
                </li>
                {actorType === "client" && (
                  <li>
                    <LocalizedClientLink
                      href={'/client/account/my-bugs'}
                      className="hover:text-ui-fg-base"
                    >
                      My Posted Bugs
                    </LocalizedClientLink>
                  </li>
                  )
                }
                {actorType === "client" && (
                  <li>
                    <LocalizedClientLink
                      href={`/client/account/my-bugs?create=true`}
                      className="hover:text-ui-fg-base"
                    >
                      Post a Bug
                    </LocalizedClientLink>
                  </li>
                  )
                }
                {actorType === "developer" && (
                  <li>
                    <LocalizedClientLink
                      href={`/${actorType}/account/my-bugs`}
                      className="hover:text-ui-fg-base"
                    >
                      My Claimed Bugs
                    </LocalizedClientLink>
                  </li>
                )}
                <li>
                  <LocalizedClientLink
                    href={`/${actorType}/account/${actorType === "client" ? "developer" : "my"}-submissions`}
                    className="hover:text-ui-fg-base"
                  >
                    {actorType === "client" ? "Developer" : "My"} Submissions
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-ui-fg-base">Account</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    href={`/${actorType}/account`}
                    className="hover:text-ui-fg-base"
                  >
                    My Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href={`/${actorType}/account/messages`}
                    className="hover:text-ui-fg-base"
                  >
                    Messages
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href={`/${actorType}/account/notifications`}
                    className="hover:text-ui-fg-base"
                  >
                    Notifications
                  </LocalizedClientLink>
                </li>
                {actorType === "developer" && (
                  <li>
                    <LocalizedClientLink
                      href="/developer/account/my-reviews"
                      className="hover:text-ui-fg-base"
                    >
                      My Reviews
                    </LocalizedClientLink>
                  </li>
                )}
              </ul>         
            </div>
            {/* Company */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-ui-fg-base">Company</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="/about"
                    className="hover:text-ui-fg-base"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/customer-service"
                    className="hover:text-ui-fg-base"
                  >
                    Customer Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-ui-fg-base"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-ui-fg-base"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex w-full mb-16 justify-between items-center border-t border-ui-border-base pt-6 text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Bugzapper Marketplace. All rights reserved.
          </Text>
          <BugzapperCTA />
        </div>
      </div>
    </footer>
  )
}

"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle, BugAntSolid, PaperPlane, ChatBubbleLeftRight, BellAlert, User } from "@medusajs/icons"
import { usePathname } from "next/navigation"
import { useState } from "react"

import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signoutClient } from "@lib/data/client"
import { useClientMe } from "@lib/hooks/use-client-me"

const ICON_SIZE = "w-6 h-6"

const AccountNav = () => {
  const route = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const handleLogout = async () => {
    await signoutClient()
  }

  const { clientData } = useClientMe()
  const { client } = clientData || {}

  const developerSubmissions = client?.bugs?.flatMap((bug) => bug.submissions) || []

  const navItems = [
    {
      href: "/client/account",
      label: "Overview",
      icon: <User className={ICON_SIZE} />,
      testId: "overview-link",
    },
    {
      href: "/client/account/my-bugs",
      label: `My Bugs (${client?.bugs?.length || 0})`,
      icon: <BugAntSolid className={ICON_SIZE} />,
      testId: "my-bugs-link",
    },
    {
      href: "/client/account/developer-submissions",
      label: `Developer Submissions (${developerSubmissions.length})`,
      icon: <PaperPlane className={ICON_SIZE} />,
      testId: "submissions-link",
    },
    {
      href: "/client/account/messages",
      label: "Messages",
      icon: <ChatBubbleLeftRight className={ICON_SIZE} />,
      testId: "messages-link",
    },
    {
      href: "/client/account/notifications",
      label: "Notifications",
      icon: <BellAlert className={ICON_SIZE} />,
      testId: "notifications-link",
    },
  ]

  return (
    <>
      {/* Mobile nav */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/client/account` ? (
          <LocalizedClientLink
            href="/client/account"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <ChevronDown className="transform rotate-90" />
            <span>Account</span>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              Hello {client?.first_name || "there"}!
            </div>
            <div className="text-base-regular">
              <ul>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <LocalizedClientLink
                      href={item.href}
                      className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                      data-testid={item.testId}
                    >
                      <div className="flex items-center gap-x-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </LocalizedClientLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>Log out</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Desktop slide-in/out nav */}
      <div className="hidden small:flex flex-row relative" data-testid="account-nav">
        <div className="flex flex-col gap-y-4 pt-1">
          {/* Toggle button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center justify-center w-5 h-5 rounded-full border border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-subtle transition-all duration-300 shrink-0"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronDown
              className={clx("transition-transform duration-300 w-3 h-3", {
                "-rotate-90": isOpen,
                "rotate-90": !isOpen,
              })}
            />
          </button>
          {/* Nav items */}
          <ul className="flex flex-col gap-y-4">
            {navItems.map((item) => {
              const active = route === item.href
              return (
                <li key={item.href}>
                  <LocalizedClientLink
                    href={item.href}
                    data-testid={item.testId}
                    className={clx(
                      "flex items-center gap-x-3 text-ui-fg-subtle hover:text-ui-fg-base transition-colors",
                      { "text-ui-fg-base font-semibold": active }
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span
                      className={clx(
                        "transition-all duration-300 overflow-hidden whitespace-nowrap text-sm",
                        isOpen ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                      )}
                    >
                      {item.label}
                    </span>
                  </LocalizedClientLink>
                </li>
              )
            })}

            {/* Logout */}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className="flex items-center gap-x-3 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
              >
                <span className="shrink-0">
                  <ArrowRightOnRectangle className={ICON_SIZE} />
                </span>
                <span
                  className={clx(
                    "transition-all duration-300 overflow-hidden whitespace-nowrap text-sm",
                    isOpen ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
                  )}
                >
                  Log out
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
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
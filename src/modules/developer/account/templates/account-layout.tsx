import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { Developer } from "@lib/data/developer"

interface AccountLayoutProps {
  developer?: Developer
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  developer,
  children,
}) => {
  return (
    <div className="flex-1 small" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-full mx-auto bg-white flex flex-col">
        <div className="flex flex-row min-h-[calc(100vh-400px)]">
          {developer && (
            <div className="shrink-0 border-r border-ui-border-base pr-8 py-12">
              <AccountNav />
            </div>
          )}
          <div className="flex-1 min-w-0 py-12 pl-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
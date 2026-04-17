import React from "react"
import AccountNav from "../components/account-nav"
import { Client } from "@lib/data/client"

interface AccountLayoutProps {
  client?: Client
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  client,
  children,
}) => {
  return (
    <div className="flex-1 small" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-full mx-auto bg-white flex flex-col">
        <div className="flex flex-row min-h-[calc(100vh-400px)]">
          {client && (
            <div className="shrink-0 border-r border-ui-border-base pr-4 py-12">
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
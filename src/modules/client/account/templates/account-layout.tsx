import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import { Client } from "@lib/data/client"

interface AccountLayoutProps {
  client?: Client
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  client,
  children,
}) => {
  // const { client } = clientData || {}

  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-12">
          <div>{client && <AccountNav />}</div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout

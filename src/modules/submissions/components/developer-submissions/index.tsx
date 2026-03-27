"use client"

import React from "react"
import BugsList from "../list-template"
import { Bug } from "@lib/data/bugs"
import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation" 
import { Client } from "@lib/data/client"

type ClientBugsProps = {
  client: Client,
}

const ClientBugs: React.FC<ClientBugsProps> = ({ client }) => {
  const router = useRouter()

  const handleEdit = (bug: Bug) => {
    router.push(`/client/account/my-bugs/${bug.id}`)
  }

  return (
    <div>
      <div className="pb-6">
        <Button
          variant="primary"
          onClick={() => {
            router.push(`/client/account/my-bugs/new`)
          }}
        >
          Add New Bug
        </Button>        
      </div>
      {/* TODO: add pagination and sorting */}
      {/* <BugsList
        queryParams={{ client_id: client.id }}
        onRowClick={handleEdit}
      /> */}
    </div>
  )
}

export default ClientBugs
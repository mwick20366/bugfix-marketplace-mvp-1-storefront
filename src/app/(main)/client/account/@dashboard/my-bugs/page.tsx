import { Metadata } from "next"
import { notFound } from "next/navigation"

import MyBugs from "@modules/client/components/my-bugs"

import { retrieveClient } from "@lib/data/client"
import { CreateBug } from "@modules/bugs/components/create-bug"
import ClientBugsView from "@modules/client/components/client-bugs-view"

export const metadata: Metadata = {
  title: "My Bugs",
  description: "View your bugs, update their status, or add new bugs to your account.",
}

export default async function Page() {
  const clientData = await retrieveClient().catch(() => null)

  if (!clientData) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My Bugs</h1>
        <p className="text-base-regular">
          View, update, or add new bugs. You can manage your bugs and track their status here.
        </p>
      </div>
      {/* <CreateBug
        client={clientData.client}
      /> */}
      <ClientBugsView client={clientData.client} />
    </div>
  )
}

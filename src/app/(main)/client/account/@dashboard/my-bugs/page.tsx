import { notFound } from "next/navigation"

import { retrieveClient } from "@lib/data/client"
import ClientBugsView from "@modules/client/components/client-bugs-view"
import { getPageMetadata } from "@modules/common/functions/metadata"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("My Posted Bugs")
  return metadata
}

export default async function Page() {
  const { Sync } = await getPageMetadata("My Posted Bugs")

  const clientData = await retrieveClient().catch(() => null)

  if (!clientData) {
    notFound()
  }

  return (
    <>
      {Sync}
      <div className="w-full" data-testid="addresses-page-wrapper">
        <div className="mb-8 flex flex-col gap-y-4">
          <h1 className="text-2xl-semi">My Bugs</h1>
          <p className="text-base-regular">
            View, update, or add new bugs. You can manage your bugs and track their status here.
          </p>
        </div>
        <ClientBugsView client={clientData.client} />
      </div>
    </>
  )
}
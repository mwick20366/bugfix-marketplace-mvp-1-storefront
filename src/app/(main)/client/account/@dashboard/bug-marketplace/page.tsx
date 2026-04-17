import { retrieveClient } from "@lib/data/client"
import ClientOpenBugs from "@modules/client/components/open-bugs"
import { redirect } from "next/navigation"
import { getPageMetadata } from "@modules/common/functions/metadata"

export async function generateMetadata({ searchParams }: Params) {
  const { metadata } = await getPageMetadata("Bugs Marketplace", searchParams)
  return metadata
}


const BUG_LIMIT = 15

type Params = {
  searchParams: Promise<{
    limit?: number
    offset?: number
    sortId?: string
    sortDesc?: boolean
    q?: string
    myBugsOnly?: string
  }>
}

export default async function Page(props: Params) {
  const { Sync } = await getPageMetadata("Bugs Marketplace", props.searchParams)

  const clientData = await retrieveClient().catch(() => null)

  if (!clientData) {
    redirect(`/login`)
  }

  const { client } = clientData

  const searchParams = await props.searchParams
  const { limit, offset, sortId, sortDesc, q, myBugsOnly } = searchParams

  const openBugsParams = {
    limit: limit || BUG_LIMIT,
    offset: offset || 0,
    q: q || "",
    sortId: sortId || "created_at",
    sortDesc: sortDesc ?? true,
    clientId: client.id,
    myBugsOnly: myBugsOnly === "true",
  }

  return (
    <>
      {Sync}
      <div className="py-12">
        <div className="content-container">
          <ClientOpenBugs {...openBugsParams} />
        </div>
      </div>
    </>
  )
}
import { retrieveClient } from "@lib/data/client"
import DeveloperSubmissions from "@modules/client/components/developer-submissions"
import { redirect } from "next/navigation"
import { getPageMetadata } from "@modules/common/functions/metadata"

const SUBMISSIONS_LIMIT = 15

type Params = {
  searchParams: Promise<{
    limit?: number
    offset?: number
    sortId?: string
    sortDesc?: boolean
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: Params) {
  const { metadata } = await getPageMetadata("Developer Submissions", searchParams)
  return metadata
}

export default async function Page(props: Params) {
  const { Sync } = await getPageMetadata("Developer Submissions", props.searchParams)

  const clientData = await retrieveClient().catch(() => null)

  if (!clientData) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  const queryParams = await props.searchParams
  const { limit, offset, q } = queryParams

  const submissionsListQueryParams = {
    limit: limit || SUBMISSIONS_LIMIT,
    offset: offset || 0,
    q: q || "",
    client: clientData.client
  }

  return (
    <>
      {Sync}
      <div className="py-12">
        <div className="content-container" data-testid="cart-container">
          <DeveloperSubmissions
            queryParams={submissionsListQueryParams}
          />
        </div>
      </div>    
    </>
  )
}

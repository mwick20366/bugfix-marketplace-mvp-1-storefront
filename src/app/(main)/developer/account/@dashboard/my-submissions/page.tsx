import { retrieveDeveloper } from "@lib/data/developer"
import { getPageMetadata } from "@modules/common/functions/metadata"
import MySubmissions from "@modules/developer/components/my-submissions"
import { redirect } from "next/navigation"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("My Submissions")
  return metadata
}

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

export default async function Page(props: Params) {
  const { Sync } = await getPageMetadata("My Submissions")

  const developerData = await retrieveDeveloper().catch(() => null)
  const { developer } = developerData || {}

  if (!developer) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  const queryParams = await props.searchParams
  const { limit, offset, sortId, sortDesc, q } = queryParams

  const submissionsListQueryParams = {
    limit: limit || SUBMISSIONS_LIMIT,
    offset: offset || 0,
    q: q || "",
    developer: developer
  }

  return (
    <>
      {Sync}
      <div className="py-12">
        <div className="content-container" data-testid="cart-container">
          <MySubmissions
            queryParams={submissionsListQueryParams}
            developer={developer}
          />
        </div>
      </div>
    </>
  )
}

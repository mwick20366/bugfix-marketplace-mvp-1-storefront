import { Bug } from "@lib/data/bugs"
import { retrieveDeveloper } from "@lib/data/developer"
import OpenBugs from "@modules/developer/components/open-bugs"
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
  }>
}

export default async function Page(props: Params) {
  const { Sync } = await getPageMetadata("Bugs Marketplace", props.searchParams)

  const developerData = await retrieveDeveloper().catch(() => null)

  if (!developerData) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  const { developer } = developerData

  const searchParams = await props.searchParams
  const { limit, offset, sortId, sortDesc, q } = searchParams

  const openBugsParams = {
    limit: limit || BUG_LIMIT,
    offset: offset || 0,
    q: q || "",
    sortId: sortId || "created_at",
    sortDesc: sortDesc || true,
  }

  return (
    <>
      {Sync}
      <div className="py-12">
        <div className="content-container" data-testid="cart-container">
          <OpenBugs
            {...openBugsParams}
            isDeveloper={!!developer.id}
            developerTechStack={developer.tech_stack || ""}
          />
        </div>
      </div>
    </>
  )
}

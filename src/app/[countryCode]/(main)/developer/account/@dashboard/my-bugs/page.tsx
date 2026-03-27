import { retrieveDeveloperBugs } from "@lib/data/bugs"
import { retrieveDeveloper } from "@lib/data/developer"
import MyBugs from "@modules/developer/components/my-bugs"
// import BugsList from "@modules/marketplace/components/open-bugs"
// import { useState } from "react"
import { redirect } from "next/navigation"

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
  const developer = await retrieveDeveloper().catch(() => null)

  if (!developer) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  const queryParams = await props.searchParams
  const { limit, offset, sortId, sortDesc, q } = queryParams

  const bugsListQueryParams = {
    limit: limit || BUG_LIMIT,
    offset: offset || 0,
    q: q || "",
    developer_id: developer.id,
  }

  // const queryFn = async (params: { limit: number; offset: number; search: string; sorting: any }) => {
  //   const bugs = await retrieveDeveloperBugs(developer.id)
  //   return {
  //     bugs: bugs || [],
  //     count: bugs?.length || 0,
  //   }
  // }

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        <MyBugs
          developer={developer}
        />
          {/* <BugsList
            queryParams={bugsListQueryParams}
            showStatus
          /> */}
      </div>
    </div>
  )
}

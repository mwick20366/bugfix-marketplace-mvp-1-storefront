import { retrieveDeveloper } from "@lib/data/developer"
import BugMarketplaceView from "@modules/developer/components/bug-marketplace-view"
import MyBugs from "@modules/developer/components/my-bugs"
import { redirect } from "next/navigation"
import { getPageMetadata } from "@modules/common/functions/metadata"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("My Bugs")
  return metadata
}

export default async function Page() {
  const { Sync } = await getPageMetadata("My Bugs")

  const developer = await retrieveDeveloper().catch(() => null)

  if (!developer) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  return (
    <>
      {Sync}
      <div className="py-12">
        <div className="content-container" data-testid="cart-container">
          <BugMarketplaceView />
        </div>
      </div>
    </> 
  )
}

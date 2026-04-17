import { getPageMetadata } from "@modules/common/functions/metadata"
import DeveloperMyReviews from "@modules/developer/components/my-reviews"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("My Reviews")
  return metadata
}

export default async function DeveloperMyReviewsPage() {
  const { Sync } = await getPageMetadata("My Reviews")

  return (
    <>
      {Sync}
      <DeveloperMyReviews />
    </>
  )
}
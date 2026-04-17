import { getPageMetadata } from "@modules/common/functions/metadata"
import DeveloperDashboard from "@modules/developer/components/dashboard"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("Developer Dashboard")
  return metadata
}

export default async function DeveloperDashboardPage() {
  const { Sync } = await getPageMetadata("Developer Dashboard")

  return (
    <>
      {Sync}
      <DeveloperDashboard />
    </>
  )
}
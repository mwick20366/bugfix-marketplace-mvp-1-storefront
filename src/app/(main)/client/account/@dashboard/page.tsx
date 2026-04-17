import ClientDashboard from "@modules/client/components/dashboard"
import { getPageMetadata } from "@modules/common/functions/metadata"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("Client Dashboard")
  return metadata
}

export default async function ClientDashboardPage() {
  const { Sync } = await getPageMetadata("Client Dashboard")

  return (
    <>
      {Sync}
      <ClientDashboard />
    </>
  )
}
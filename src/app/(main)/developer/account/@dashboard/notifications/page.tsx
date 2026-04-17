import { getPageMetadata } from "@modules/common/functions/metadata"
import DeveloperNotifications from "@modules/developer/components/in-app-notifications"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("My Notifications")
  return metadata
}

export default async function DeveloperNotificationsPage() {
  const { Sync } = await getPageMetadata("My Notifications")
  return (
    <>
      {Sync}
      <DeveloperNotifications />
    </>
  )
}
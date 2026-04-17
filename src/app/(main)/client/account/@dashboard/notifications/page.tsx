import ClientNotifications from "@modules/client/components/in-app-notifications";
import { createPageMetadata } from "@modules/common/functions/create-page-metadata"
import { getPageMetadata } from "@modules/common/functions/metadata";

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("Client Notifications")
  return metadata
}

export default async function ClientNotificationsPage() {
  const { Sync } = await getPageMetadata("Client Notifications")

  return (
    <>
      {Sync}
      <div className="py-12">
        <div className="content-container flex flex-col gap-y-4">
          <ClientNotifications />
        </div>
      </div>
    </>
  )
}
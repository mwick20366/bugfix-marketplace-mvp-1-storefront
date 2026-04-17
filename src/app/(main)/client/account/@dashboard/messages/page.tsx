import ClientMessages from "@modules/client/components/messages"
import { createPageMetadata } from "@modules/common/functions/create-page-metadata"
import { getPageMetadata } from "@modules/common/functions/metadata"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("Client Messages")
  return metadata
}

export default async function MessagesPage() {
  const { Sync } = await getPageMetadata("Client Messages")

  return (
    <>
      {Sync}
      <ClientMessages />
    </>
  )
}

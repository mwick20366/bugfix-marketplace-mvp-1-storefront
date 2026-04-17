import { getPageMetadata } from "@modules/common/functions/metadata"
import Messages from "@modules/developer/components/messages"

export async function generateMetadata() {
  const { metadata } = await getPageMetadata("My Messages")
  return metadata
}

export default async function MessagesPage() {
  const { Sync } = await getPageMetadata("My Messages")
  return (
    <>
      {Sync}
      <Messages />
    </>
  )
}

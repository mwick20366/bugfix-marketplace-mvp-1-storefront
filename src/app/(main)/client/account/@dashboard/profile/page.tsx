// src/app/[countryCode]/(main)/client/account/@dashboard/profile/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Client, retrieveClient } from "@lib/data/client"
import ClientProfile from "@modules/client/components/profile"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Bugzapper Marketplace profile.",
}

export default async function Profile() {
  const clientData = await retrieveClient().catch(() => null)

  if (!clientData) {
    notFound()
  }

  const { client } = clientData

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Profile</h1>
        <p className="text-base-regular">
          View and update your profile information, including your name and
          avatar.
        </p>
      </div>
      <div className="flex flex-col gap-y-8 w-full">
        <ClientProfile client={client} />
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}
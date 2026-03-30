import { Metadata } from "next"
import { notFound } from "next/navigation"

import MyBugs from "@modules/client/components/my-bugs"

import { retrieveClient } from "@lib/data/client"
import { CreateBug } from "@modules/bugs/components/create-bug"

export const metadata: Metadata = {
  title: "My Bugs",
  description: "View your bugs, update their status, or add new bugs to your account.",
}

export default async function Page(props: {
  params: Promise<{ countryCode: string }>
}) {
  const client = await retrieveClient()

  if (!client) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My Bugs</h1>
        <p className="text-base-regular">
          View, update, or add new bugs. You can manage your bugs and track their status here.
        </p>
      </div>
      <CreateBug
        client={client}
      />
      <MyBugs client={client} />
    </div>
  )
}

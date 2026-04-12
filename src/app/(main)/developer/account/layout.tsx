import { retrieveDeveloper } from "@lib/data/developer"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/developer/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const developerData = await retrieveDeveloper().catch(() => null)
  const { developer } = developerData || {}

  return (
    <AccountLayout developer={developer}>
      {developer ? dashboard : login}
      <Toaster />
    </AccountLayout>
  )
}

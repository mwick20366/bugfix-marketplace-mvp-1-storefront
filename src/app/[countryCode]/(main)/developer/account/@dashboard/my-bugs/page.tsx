import { retrieveDeveloper } from "@lib/data/developer"
import MyBugs from "@modules/developer/components/my-bugs"
import { redirect } from "next/navigation"

export default async function Page() {
  const developer = await retrieveDeveloper().catch(() => null)

  if (!developer) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        <MyBugs />
      </div>
    </div>
  )
}

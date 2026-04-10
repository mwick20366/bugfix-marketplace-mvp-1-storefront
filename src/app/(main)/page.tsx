// src/app/(main)/page.tsx
import { getCountryCode } from "@lib/data/cookies"

export default async function Home() {
  const countryCode = await getCountryCode()

  if (!countryCode) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-y-4 px-8">
      <h1 className="text-3xl font-semibold">Welcome to Bugzapper</h1>
      <p className="text-ui-fg-subtle text-center max-w-md">
        A marketplace connecting clients with developers to fix bugs and ship faster.
      </p>
      <div className="flex gap-x-4 mt-4">
        <a
          href="/marketplace"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Browse Bugs
        </a>
        <a
          href="/developer/account"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          Developer Dashboard
        </a>
        <a
          href="/client/account"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          Client Dashboard
        </a>
      </div>
    </div>
  )
}
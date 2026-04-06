// src/modules/client/components/client-bugs-view/index.tsx
"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import BugFilters from "@modules/developer/components/bug-filters"
import MyBugs from "../my-bugs"
import { Client } from "@lib/data/client"
// import ClientBugsList from "@modules/client/components/client-bugs-list"
// import MyBugs from "../my-bugs"

export default function ClientBugsView({ client }: { client: Client }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedStatuses = searchParams.getAll("status")
  const selectedDifficulties = searchParams.getAll("difficulty")

  const updateFilters = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(key)
      values.forEach((v) => params.append(key, v))
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  return (
    <div className="flex gap-x-8">
      <aside className="w-48 shrink-0">
        <BugFilters
          selectedStatuses={selectedStatuses}
          selectedDifficulties={selectedDifficulties}
          onStatusChange={(values) => updateFilters("status", values)}
          onDifficultyChange={(values) => updateFilters("difficulty", values)}
        />
      </aside>

      <div className="flex-1">
        <MyBugs
          client={client}
          statusFilter={selectedStatuses}
          difficultyFilter={selectedDifficulties}
        />
      </div>
    </div>
  )
}
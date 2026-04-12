// src/modules/marketplace/components/browse-bugs-view/index.tsx
"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import BugFilters from "@modules/developer/components/bug-filters"
import MarketplaceBugs from "../marketplace-bugs"
import DifficultyFilter from "@modules/bugs/components/difficulty-filter"

export default function BrowseBugsView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
        <DifficultyFilter
          selectedDifficulties={selectedDifficulties}
          onDifficultyChange={(values) => updateFilters("difficulty", values)}
        />
      </aside>

      <div className="flex-1">
        <MarketplaceBugs
          difficultyFilter={selectedDifficulties}
        />
      </div>
    </div>
  )
}
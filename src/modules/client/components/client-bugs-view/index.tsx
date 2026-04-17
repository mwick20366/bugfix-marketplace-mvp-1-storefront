// src/modules/client/components/client-bugs-view/index.tsx
"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import BugFilters from "@modules/client/components/bug-filters"
import MyBugs from "../my-bugs"
import { Client } from "@lib/data/client"
import { CreateBug } from "@modules/bugs/components/create-bug"
import { useQueryClient } from "@tanstack/react-query"

export default function ClientBugsView({ client }: { client: Client }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const selectedStatuses = searchParams.getAll("status")
  const selectedDifficulties = searchParams.getAll("difficulty")

  // Detect ?create=true and open the modal
  useEffect(() => {
    const create = searchParams.get("create")
    if (create === "true") {
      setIsCreateModalOpen(true)
      // Clean up the URL param so refreshing doesn't re-open the modal
      const params = new URLSearchParams(searchParams.toString())
      params.delete("create")
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl)
    }
  }, [searchParams])

  const updateFilters = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(key)
      values.forEach((v) => params.append(key, v))
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  if (!client.bugs || client.bugs.length === 0) {
    return (
      <>
        <CreateBug
          client={client}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={() => {
            setIsCreateModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ["bugs"] })
          }}
        />
        <div className="p-6 mt-6 border rounded">
          <h2 className="text-lg-semi mb-2">No bugs found</h2>
          <p className="text-base-regular">
            You haven't added any bugs yet. Click the "Create Bug" button above to create your first bug!
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <CreateBug
        client={client}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={() => {
          setIsCreateModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ["bugs"] })
        }}
      />

      <div className="flex gap-x-8">
        <aside className="w-48 shrink-0">
          <BugFilters
            selectedStatuses={selectedStatuses}
            selectedDifficulties={selectedDifficulties}
            onStatusChange={(values: string[]) => updateFilters("status", values)}
            onDifficultyChange={(values: string[]) => updateFilters("difficulty", values)}
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
    </>
  )
}
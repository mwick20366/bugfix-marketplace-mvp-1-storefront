"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Bug, listBugs } from "@lib/data/bugs"
import { DataTablePaginationState, DataTableSortingState, DataTableColumnDef } from "@medusajs/ui"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { bountyColumn, createdAtColumn, difficultyColumn, techStackColumn, titleColumn } from "@modules/bugs/components/list-template/columns"
import OpenBugsDetailsModal from "@modules/developer/components/open-bugs-details-modal"

const BUG_LIMIT = 15

type ClientBugsProps = {
  limit?: number
  offset?: number
  q?: string
  clientId: string
  sortId: string
  sortDesc: boolean
  myBugsOnly?: boolean
  showStatus?: boolean
}

export default function ClientOpenBugs(props: ClientBugsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { limit = BUG_LIMIT, clientId, sortId, sortDesc } = props

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit,
  })

  const [search, setSearch] = useState<string>("")
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)
  const [myBugsOnly, setMyBugsOnly] = useState<boolean>(props.myBugsOnly ?? false)

  if (sortId && !sorting) {
    setSorting({ id: sortId, desc: sortDesc })
  }

  const offset = useMemo(() => pagination.pageIndex * limit, [pagination])

  const columns: DataTableColumnDef<Bug>[] = [
    titleColumn,
    techStackColumn,
    createdAtColumn,
    bountyColumn,
    difficultyColumn,
  ] as DataTableColumnDef<Bug>[]

  const queryKey = useMemo(() => {
    return ["bugs", limit, offset, search, sorting?.id, sorting?.desc, myBugsOnly, clientId]
  }, [offset, search, sorting?.id, sorting?.desc, myBugsOnly, clientId])

  const { data, isLoading } = useQuery<{ bugs: Bug[]; count: number }, Error>({
    queryFn: async () => {
      const result = await listBugs({
        queryParams: {
          limit,
          offset,
          order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
          q: search,
          status: "open",
          ...(myBugsOnly ? { client_id: clientId } : {}),
        },
      })
      return result.response
    },
    queryKey,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    const bugId = searchParams.get("bugId")
    if (bugId) {
      setSelectedBugId(bugId)
      setIsModalOpen(true)
    }
  }, [searchParams])

  const handleRowClicked = (bug: Bug) => {
    setSelectedBugId(bug.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBugId(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("bugId")
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  const handleToggleMyBugs = () => {
    setMyBugsOnly((prev) => !prev)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className="text-2xl">Bug Marketplace</h1>
        <button
          onClick={handleToggleMyBugs}
          className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
            myBugsOnly
              ? "bg-ui-bg-interactive text-ui-fg-on-color border-ui-border-interactive"
              : "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base hover:text-ui-fg-base"
          }`}
        >
          {myBugsOnly ? "Showing My Bugs" : "Show My Bugs Only"}
        </button>
      </div>
      <BugsListTemplate
        bugs={data?.bugs || []}
        columns={columns}
        rowCount={data?.count ?? 0}
        isLoading={isLoading}
        onRowClick={handleRowClicked}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        search={search}
        setSearch={setSearch}
      />
      {selectedBugId && (
        <OpenBugsDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bugId={selectedBugId}
          isDeveloper={false}
        />
      )}
    </div>
  )
}
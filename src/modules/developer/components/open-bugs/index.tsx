"use client"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Bug, listBugs } from "@lib/data/bugs"
import { DataTablePaginationState, DataTableSortingState, DataTableColumnDef } from "@medusajs/ui"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { bountyColumn, createdAtColumn, difficultyColumn, techStackColumn, titleColumn } from "@modules/bugs/components/list-template/columns"
import OpenBugsDetailsModal from "../open-bugs-details-modal"

const BUG_LIMIT = 15

type BugsProps = {
  limit?: number,
  offset?: number,
  q?: string,
  isDeveloper?: boolean,
  client_id?: string,
  sortId: string,
  sortDesc: boolean,
  showStatus?: boolean,
}

export default function OpenBugs(props: BugsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const {
    limit = BUG_LIMIT,
    isDeveloper,
    client_id,
    sortId,
    sortDesc,
  } = props

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit!,
  })

  const offset = useMemo(() => {
    return pagination.pageIndex * limit!
  }, [pagination])

  const [search, setSearch] = useState<string>("")
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)

  if (sortId && !sorting) {
    setSorting({
      id: sortId,
      desc: sortDesc,
    })
  }

  const columns: DataTableColumnDef<Bug>[] = [
    titleColumn,
    techStackColumn,
    createdAtColumn,
    bountyColumn,
    difficultyColumn,
  ] as DataTableColumnDef<Bug>[];

  const queryKey = useMemo(() => {
    return ["bugs", limit, offset, search, sorting?.id, sorting?.desc, isDeveloper, client_id]
  }, [offset, search, sorting?.id, sorting?.desc, isDeveloper, client_id])

  const { data, isLoading } = useQuery<{ bugs: Bug[]; count: number }, Error>({
    queryFn: async () => {
      const result = await listBugs({
        queryParams: {
          limit,
          offset,
          order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
          q: search,
          status: "open",
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

    // Remove bugId from URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.delete("bugId")
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  const handleClaimBug = async () => {
    setIsModalOpen(false)
    setSelectedBugId(null)
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Bugs</h1>
      </div>
      <BugsListTemplate
        bugs={data?.bugs || []}
        columns={columns}
        rowCount={data ? data.count : 0}
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
          isDeveloper={isDeveloper}
        />
      )}
    </div>
  )
}

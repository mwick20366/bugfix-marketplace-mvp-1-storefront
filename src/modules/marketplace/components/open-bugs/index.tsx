"use client"
import { Bug, listBugs } from "@lib/data/bugs"
import { DataTablePaginationState, DataTableSortingState } from "@medusajs/ui"
import ClaimBugModal from "@modules/developer/components/claim-bug-modal"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

const BUG_LIMIT = 15

type BugsProps = {
  limit?: number,
  offset?: number,
  q?: string,
  // status?: string,
  developer_id?: string,
  client_id?: string,
  sortId: string,
  sortDesc: boolean,
  //onRowClick?: (bug: Bug) => void,
  showStatus?: boolean,
}

export default function OpenBugs(props: BugsProps) {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const {
    limit = BUG_LIMIT,
    // offset = 0,
    q = "",
    // status,
    developer_id,
    client_id,
    sortId,
    sortDesc,
    // onRowClick,
    showStatus,
  } = props

  // const { limit, developer_id, client_id } = queryParams || {
  //   limit: BUG_LIMIT,
  //   developer_id: undefined,
  //   client_id: undefined,
  // }

  // const queryParams = {
  //   limit: BUG_LIMIT,
  //   status: "open",
  // }

  // const sortingParams = {
  //   sortId: "created_at",
  //   sortDesc: true,
  // }

  // const limit = queryParams?.limit || 15
  // const developer_id = queryParams?.developer_id || undefined
  // const client_id = queryParams?.client_id || undefined

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

  const queryKey = useMemo(() => {
    return ["bugs", limit, offset, search, sorting?.id, sorting?.desc, developer_id, client_id]
  }, [offset, search, sorting?.id, sorting?.desc, developer_id, client_id])

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

  const handleRowClicked = (bug: Bug) => {
    setSelectedBug(bug)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBug(null)
  }

  const handleClaimBug = async () => {
    setIsModalOpen(false)
    setSelectedBug(null)
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Bugs</h1>
      </div>
      <BugsListTemplate
        bugs={data?.bugs || []}
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
      {selectedBug && (
        <ClaimBugModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleClaimBug}
          bug={selectedBug}
        />
      )}
    </div>
  )
}

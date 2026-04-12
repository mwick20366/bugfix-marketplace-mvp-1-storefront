// src/modules/marketplace/components/marketplace-bugs/index.tsx
"use client"

import { Bug, listMarketplaceBugs } from "@lib/data/bugs"
import {
  createDataTableColumnHelper,
  DataTablePaginationState,
  DataTableSortingState,
  DataTableColumnDef,
} from "@medusajs/ui"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { bountyColumn, convertDateToRelative, difficultyColumn, techStackColumn, titleColumn } from "@modules/bugs/components/list-template/columns"
import MarketplaceBugDetailsModal from "../bug-details-modal"

const columnHelper = createDataTableColumnHelper<Bug>()

const columns = [
  titleColumn,
  techStackColumn,
  columnHelper.accessor("created_at", {
    header: "Posted",
    enableSorting: true,
    sortLabel: "Posted",
    sortAscLabel: "Oldest first",
    sortDescLabel: "Newest first",
    cell: ({ row }) => {
      return convertDateToRelative(row.original.created_at)
    },
  }),
  bountyColumn,
  difficultyColumn,
]

const BUG_LIMIT = 15

type MarketplaceBugsProps = {
  difficultyFilter?: string[]
}

export default function MarketplaceBugs({ difficultyFilter = [] }: MarketplaceBugsProps) {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)  

  const limit = BUG_LIMIT

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit,
  })

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const [search, setSearch] = useState<string>("")
  const [sorting, setSorting] = useState<DataTableSortingState | null>({
    id: "created_at",
    desc: true,
  })

  const queryKey = useMemo(() => {
    return ["marketplace-bugs", limit, offset, search, sorting?.id, sorting?.desc, difficultyFilter]
  }, [offset, search, sorting?.id, sorting?.desc, difficultyFilter])

  const { data, isLoading } = useQuery({
    queryFn: () => {
      console.log("fetching marketplace bugs with params:", {
        limit,
        offset,
        order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
        q: search,
        ...(difficultyFilter.length > 0 ? { difficulty: difficultyFilter } : {}),
      })

      return listMarketplaceBugs({
      queryParams: {
        limit,
        offset,
        order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
        q: search,
        ...(difficultyFilter.length > 0 ? { difficulty: difficultyFilter } : {}),
      },
    })
    },
    queryKey,
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [difficultyFilter])

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
      {/* <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Browse Open Bugs</h1>
      </div> */}
      <BugsListTemplate
        bugs={data?.response?.bugs || []}
        columns={columns as DataTableColumnDef<Bug>[]}
        rowCount={data ? data.response?.count : 0}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        search={search}
        onRowClick={handleRowClicked}
        setSearch={setSearch}
      />
      {selectedBug && (
        <MarketplaceBugDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bug={selectedBug}
          isDeveloper={false}
        />
      )}      
    </div>
  )
}
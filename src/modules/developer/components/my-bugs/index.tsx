"use client"
import { Bug, claimBug, listBugs } from "@lib/data/bugs"
import { Developer } from "@lib/data/developer"
import { convertToLocale } from "@lib/util/money"
import {
  createDataTableColumnHelper,
  DataTablePaginationState,
  DataTableSortingState,
  DataTableColumnDef,
} from "@medusajs/ui"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import BugDetailsModal from "@modules/developer/components/bug-details-modal"
import { useDeveloperMe } from "@lib/hooks/use-developer-me"

const columnHelper = createDataTableColumnHelper<Bug>()

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    enableSorting: true,
    sortLabel: "Title",
    sortAscLabel: "A-Z",
    sortDescLabel: "Z-A",
  }),
  columnHelper.accessor("updated_at", {
      header: "Claimed",
      enableSorting: true,
      sortLabel: "Claimed",
      sortAscLabel: "Oldest first",
      sortDescLabel: "Newest first",
      cell: ({ getValue }) => {
        const date = new Date(getValue())
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffSeconds = Math.floor(diffMs / 1000)
        const diffMinutes = Math.floor(diffSeconds / 60)
        const diffHours = Math.floor(diffMinutes / 60)
        const diffDays = Math.floor(diffHours / 24)
        const diffWeeks = Math.floor(diffDays / 7)

        if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
        if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
        return "Just now"
      },
    }),
  columnHelper.accessor("bounty", {
    header: "Bounty",
    enableSorting: true,
    sortLabel: "Bounty",
    sortAscLabel: "Low to High",
    sortDescLabel: "High to Low",
    cell: ({ getValue }) => {
      const bounty = getValue()

      if (bounty == null) {
          return <div className="flex h-full w-full items-center justify-end"><span className="text-ui-fg-muted">-</span></div>
        }
        return (
          <div className="flex h-full w-full items-center justify-end text-right">
            {convertToLocale({
              amount: bounty,
              locale: "en-US",
              currency_code: "usd",
            })}
          </div>
        )
    }
  }),
  columnHelper.accessor("status", {
    header: "Status",
    enableSorting: true,
    sortLabel: "Status",
    sortAscLabel: "A-Z",
    sortDescLabel: "Z-A",
    cell: ({ getValue }) => {
      const status = getValue() as string
      let color = "gray"
      if (status === "open") color = "green"
      else if (status === "claimed") color = "yellow"
      else if (status === "closed") color = "red"
      return (
        <div className={`flex h-full w-full items-center justify-start gap-2 text-sm font-medium text-${color}-600`}>
          <span
            className={`inline-block h-2 w-2 rounded-full bg-${color}-600`}
          ></span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      )
    },
  })
]

const BUG_LIMIT = 15

export default function MyBugs() {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { developer } = useDeveloperMe()

  const queryParams = {
    limit: BUG_LIMIT,
    developer_id: developer?.id,
  }

  const sortingParams = {
    sortId: "created_at",
    sortDesc: true,
  }

  const limit = queryParams?.limit || 15

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit,
  })

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const [search, setSearch] = useState<string>("")
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)

  if (sortingParams && !sorting) {
    setSorting({
      id: sortingParams.sortId,
      desc: sortingParams.sortDesc,
    })
  }

  const queryKey = useMemo(() => {
    return ["my-bugs", limit, offset, search, sorting?.id, sorting?.desc]
  }, [offset, search, sorting?.id, sorting?.desc])

  const { data, isLoading, refetch } = useQuery({
    queryFn: () => listBugs({
      queryParams: {
        ...queryParams,
        limit,
        offset,
        order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
        q: search,
      },
    }),
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

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Bugs</h1>
      </div>
      <BugsListTemplate
        bugs={data?.response?.bugs || []}
        columns={columns as DataTableColumnDef<Bug>[]}
        rowCount={data ? data.response?.count : 0}
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
        <BugDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onFixSubmitted={refetch}
          bug={selectedBug}
        />
      )}
    </div>
  )
}

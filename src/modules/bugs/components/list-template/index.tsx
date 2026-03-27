"use client"

import { Bug } from "@lib/data/bugs"
import {
  DataTable,
  createDataTableColumnHelper,
  useDataTable,
  DataTablePaginationState,
  DataTableSortingState,
  Button,
  DataTableColumnDef,
} from "@medusajs/ui"

import { convertToLocale } from "@lib/util/money"

const columnHelper = createDataTableColumnHelper<Bug>()

const defaultColumns = [
  columnHelper.accessor("title", {
    header: "Title",
    enableSorting: true,
    sortLabel: "Title",
    sortAscLabel: "A-Z",
    sortDescLabel: "Z-A",
  }),
  columnHelper.accessor("description", {
    header: "Description",
    enableSorting: false,
  }),
  columnHelper.accessor("techStack", {
    header: "Tech Stack",
    enableSorting: false,
  }),
  columnHelper.accessor("created_at", {
      header: "Posted",
      enableSorting: true,
      sortLabel: "Posted",
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
]

type BugsListTemplateProps = {
  bugs: Bug[]
  columns?: DataTableColumnDef<Bug>[],
  rowCount: number
  isLoading: boolean
  pagination: DataTablePaginationState
  setPagination: (pagination: DataTablePaginationState) => void
  sorting: DataTableSortingState | null
  setSorting: (sorting: DataTableSortingState | null) => void
  queryParams?: {
    limit?: number,
    offset?: number,
    q?: string,
    status?: string,
    developer_id?: string,
    client_id?: string,
  }
  search?: string
  setSearch: (search: string) => void
  actionButtons?: React.ReactNode
  onRowClick?: (bug: Bug) => void
}

const BugsListTemplate = ({
  bugs,
  rowCount,
  isLoading,
  pagination,
  setPagination,
  sorting,
  setSorting,
  queryParams,
  search,
  setSearch,
  onRowClick,
  columns,
}: BugsListTemplateProps) => {
  const limit = queryParams?.limit || 15

  const table = useDataTable({
    columns: columns || defaultColumns,
    data: bugs,
    getRowId: (row) => row.id,
    rowCount: rowCount,
    isLoading,
    search: {
      state: search || "",
      onSearchChange: setSearch,
    },
    pagination: {
      state: pagination || {
        pageIndex: 0,
        pageSize: limit,
      },
      onPaginationChange: setPagination,
    },
    sorting: {
      state: sorting,
      onSortingChange: setSorting,
    },
  })
  
  if (onRowClick) {
    table.onRowClick = (event, row) => {
      if (onRowClick) {
        onRowClick(row.original)
      }
    }
  }

  return (
    <div
      // className={clx({
      //   "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
      //     hasOverflow,
      // })}
    >
      <DataTable instance={table}>
        <div className="mt-6 mb-6 flex gap-2 items-center">
          <DataTable.Search placeholder="Search..." />
          {search && (
            <Button
              variant="transparent"
              size="small"
              onClick={() => setSearch("")}
            >
              Clear
            </Button>
        )}
        </div>
        {/* <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <DataTable.SortingMenu tooltip="Sort" />
        </DataTable.Toolbar> */}
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </div>
  )
}

export default BugsListTemplate

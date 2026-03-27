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
import { Submission } from "@lib/data/submissions"

const columnHelper = createDataTableColumnHelper<Submission>()

const defaultColumns = [
  columnHelper.accessor("bug.title", {
    header: "Bug",
    enableSorting: true,
    sortLabel: "Bug",
    sortAscLabel: "A-Z",
    sortDescLabel: "Z-A",
  }),
  columnHelper.accessor("bug.description", {
    header: "Bug Description",
    enableSorting: false,
  }),
  columnHelper.accessor("notes", {
    header: "Notes",
    enableSorting: false,
  }),
  columnHelper.accessor("fileUrl", {
    header: "File",
    enableSorting: false,
  }),  
  columnHelper.accessor("created_at", {
      header: "Submitted",
      enableSorting: true,
      sortLabel: "Submitted",
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


type SubmissionsListTemplateProps = {
  submissions: Submission[]
  columns?: DataTableColumnDef<Submission>[],
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
  onRowClick?: (submission: Submission) => void
}

const SubmissionsListTemplate = ({
  submissions,
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
}: SubmissionsListTemplateProps) => {
  const limit = queryParams?.limit || 15

  const table = useDataTable({
    columns: columns || defaultColumns,
    data: submissions,
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

export default SubmissionsListTemplate

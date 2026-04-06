"use client"
import { Bug, listBugs } from "@lib/data/bugs"
import { Client } from "@lib/data/client"
import { convertToLocale } from "@lib/util/money"
import {
  createDataTableColumnHelper,
  DataTablePaginationState,
  DataTableSortingState,
  DataTableColumnDef,
  toast,
  IconButton,
  Tooltip
} from "@medusajs/ui"
import { Pencil, Trash } from "@medusajs/icons"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useClaimBug } from "@lib/hooks/use-claim-bug"
import ClientBugDetailsModal from "../bug-details-modal"
import { title } from "process"
import { bountyColumn, createdAtColumn, clientStatusColumn, tech_stackColumn, titleColumn, difficultyColumn } from "@modules/bugs/components/list-template/columns"
import { EditBugDrawer } from "@modules/bugs/components/edit-bug"

const columnHelper = createDataTableColumnHelper<Bug>()

const createColumns = (
  onEdit: (bug: Bug) => void,
  onDelete: (bug: Bug) => void
) => [
  titleColumn,
  tech_stackColumn,
  createdAtColumn,
  bountyColumn,
  clientStatusColumn,
  difficultyColumn,
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => {
      
      const bug = row.original
      const canDelete = bug.status === "open"

      const deleteButton = (
        <IconButton
          size="small"
          variant="transparent"
          onClick={() => canDelete && onDelete(bug)}
          disabled={!canDelete}
        >
          <Trash />
        </IconButton>
      )

      return (
        <div className="flex items-center gap-x-2" onClick={(e) => e.stopPropagation()}>
          <IconButton
            size="small"
            variant="transparent"
            onClick={() => onEdit(bug)}
          >
            <Pencil />
          </IconButton>
          {canDelete ? (
            deleteButton
          ) : (
            <Tooltip content="You can only delete open bugs">
              {deleteButton}
            </Tooltip>
          )}
        </div>
      )
    },
  }),
]

const BUG_LIMIT = 15

type MyBugsProps = {
  client: Client,
  statusFilter?: string[]
  difficultyFilter?: string[]
}

export default function MyBugs(props: MyBugsProps) {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const { client, statusFilter = [], difficultyFilter = [] } = props

  const queryParams = {
    limit: BUG_LIMIT,
    client_id: client.id,
  }

  const sortingParams = {
    sortId: "created_at",
    sortDesc: true,
  }

  const limit = queryParams?.limit || 15

  const columns = useMemo(() => createColumns(
    (bug) => { setSelectedBug(bug); setIsDrawerOpen(true) },
    (bug) => { /* trigger delete mutation */ }
  ), [])

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
    return ["client-bugs", limit, offset, search, sorting?.id, sorting?.desc, statusFilter, difficultyFilter]
  }, [offset, search, sorting?.id, sorting?.desc, statusFilter, difficultyFilter])

  const { data, isLoading } = useQuery({
    queryFn: () => listBugs({
      queryParams: {
        client_id: client?.id,
        limit,
        offset,
        order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
        q: search,
        ...(statusFilter.length > 0 ? { status: statusFilter } : {}),
        ...(difficultyFilter.length > 0 ? { difficulty: difficultyFilter } : {}),
      },
    }),
    queryKey,
    placeholderData: keepPreviousData,
    enabled: !!client?.id,
  })

  const handleRowClicked = (bug: Bug) => {
    setSelectedBug(bug)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBug(null)
  }

  const { mutate: claimBug } = useClaimBug(selectedBug?.id || "") 

  const queryClient = useQueryClient()

  const handleClaimBug = async () => {
    claimBug(undefined, {
      onSuccess: () => {
        toast.success("Bug claimed successfully")
        
        queryClient.invalidateQueries({ queryKey: ["bugs"] })

        setIsModalOpen(false)
        setSelectedBug(null)
      },
      onError: (error) => {
        toast.error(`Failed to claim bug: ${error.message}`)
      },
    })
  }

  return (
    <div className="w-full">
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
        <ClientBugDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleClaimBug}
          bug={selectedBug}
        />
      )}
      {selectedBug && (
        <EditBugDrawer
          isOpen={isDrawerOpen}
          onClose={setIsDrawerOpen}
          bug={selectedBug}
        />
      )}
    </div>
  )
}

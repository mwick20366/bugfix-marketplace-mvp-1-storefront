"use client"
import { Bug, listBugs } from "@lib/data/bugs"
import { Client } from "@lib/data/client"
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
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useClaimBug } from "@lib/hooks/use-claim-bug"
import ClientBugDetailsModal from "../bug-details-modal"
import { bountyColumn, createdAtColumn, clientStatusColumn, techStackColumn, titleColumn, difficultyColumn, createMessagesColumn } from "@modules/bugs/components/list-template/columns"
import { EditBugDrawer } from "@modules/bugs/components/edit-bug"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const columnHelper = createDataTableColumnHelper<Bug>()

const createColumns = (
  client: Client,
  onEdit: (bug: Bug) => void,
  onDelete: (bug: Bug) => void
) => [
  titleColumn,
  techStackColumn,
  createdAtColumn,
  bountyColumn,
  clientStatusColumn,
  difficultyColumn,
  createMessagesColumn(client.id, "client"),
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)
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

  const handleEdit = (bug: Bug) => {
    setSelectedBugId(bug.id)
    setIsDrawerOpen(true)
  }

  const columns = useMemo(() => createColumns(
    client,
    handleEdit,
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
    return ["bugs", limit, offset, search, sorting?.id, sorting?.desc, statusFilter, difficultyFilter]
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
    setSelectedBugId(bug.id)
    setIsModalOpen(true)
  }

  useEffect(() => {
    const bugId = searchParams.get("bugId")
    if (bugId) {
      setSelectedBugId(bugId)
      setIsModalOpen(true)
    }
  }, [searchParams])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBugId(null)

    // Remove bugId from URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.delete("bugId")
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  const { mutate: claimBug } = useClaimBug(selectedBugId || "") 

  const queryClient = useQueryClient()

  const handleClaimBug = async () => {
    claimBug(undefined, {
      onSuccess: () => {
        toast.success("Bug claimed successfully")
        
        queryClient.invalidateQueries({ queryKey: ["bugs"] })

        setIsModalOpen(false)
        setSelectedBugId(null)
      },
      onError: (error) => {
        toast.error(`Failed to claim bug: ${error.message}`)
      },
    })
  }

  const handleReviewSubmission = () => {
    // logic to open review submission modal goes here
    toast.info("Review submission functionality is not implemented yet.")
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
      {selectedBugId && (
        <ClientBugDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleClaimBug}
          messageSectionHeight={300}
          onReviewSubmission={handleReviewSubmission}
          bugId={selectedBugId}
          onEdit={handleEdit}
          onDelete={(bug) => {
            // trigger your delete mutation here, same as the list column
          }}
        />
      )}
      {selectedBugId && (
        <EditBugDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          bug={data?.response?.bugs.find((b) => b.id === selectedBugId)!}
        />
      )}
    </div>
  )
}

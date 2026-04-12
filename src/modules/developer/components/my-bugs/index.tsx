"use client"
import { Bug, listBugs } from "@lib/data/bugs"
import {
  createDataTableColumnHelper,
  DataTablePaginationState,
  DataTableSortingState,
  DataTableColumnDef,
  toast,
  IconButton,
  Tooltip,  
  usePrompt
} from "@medusajs/ui"
import { ArrowUturnLeft, PaperPlane } from "@medusajs/icons"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { DeveloperBugDetailsModal } from "@modules/developer/components/bug-details-modal"
import { useDeveloperMe } from "@lib/hooks/use-developer-me"
import { useUnclaimBug } from "@lib/hooks/use-unclaim-bug"
import SubmitFixModal from "../submit-fix-modal"
import { bountyColumn, convertDateToRelative, createMessagesColumn, developerStatusColumn, difficultyColumn, titleColumn } from "@modules/bugs/components/list-template/columns"
import { Developer } from "@lib/data/developer"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const columnHelper = createDataTableColumnHelper<Bug>()

const createColumns = (
  developer: Developer,
  onSubmitFix: (bug: Bug) => void,
  onUnclaimBug: (bug: Bug) => void
) => [
  titleColumn,
  columnHelper.accessor("claimed_at", {
    header: "Claimed",
    enableSorting: true,
    sortLabel: "Claimed",
    sortAscLabel: "Oldest first",
    sortDescLabel: "Newest first",
    cell: ({ row }) => {
      const date = row.original.claimed_at || row.original.updated_at
      return convertDateToRelative(date)
    },
  }),
  bountyColumn,
  difficultyColumn,
  developerStatusColumn,
  createMessagesColumn(developer?.id || "", "developer"),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const bug = row.original
      const canSubmitFix = bug.status === "claimed"
      const canUnclaim = bug.status === "claimed"

      const unclaimButton = (
        <IconButton
          size="small"
          variant="transparent"
          onClick={() => canUnclaim && onUnclaimBug(bug)}
          disabled={!canUnclaim}
        >
          <ArrowUturnLeft />
        </IconButton>
      )

      const submitButton = (
        <IconButton
          size="small"
          variant="transparent"
          onClick={() => canSubmitFix && onSubmitFix(bug)}
          disabled={!canSubmitFix}
        >
          <PaperPlane />
        </IconButton>
      )

      return (
        <div className="flex items-center gap-x-2" onClick={(e) => e.stopPropagation()}>
          {canSubmitFix ? (
            <Tooltip content="Submit a fix for this bug">{submitButton}</Tooltip>
          ) : (
            <Tooltip content="You can only submit a fix for claimed bugs">{submitButton}</Tooltip>
          )}
          {canUnclaim ? (
            <Tooltip content="Unclaim this bug">{unclaimButton}</Tooltip>
          ) : (
            <Tooltip content="You can only unclaim claimed bugs">{unclaimButton}</Tooltip>
          )}
        </div>
      )
    },
  }),
]

const BUG_LIMIT = 15

type MyBugsProps = {
  statusFilter?: string[]
  difficultyFilter?: string[]
}

export default function MyBugs({ statusFilter = [], difficultyFilter = [] }: MyBugsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedBugId, setSelectedBugId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSubmitFixOpen, setIsSubmitFixOpen] = useState(false)

  const { developerData } = useDeveloperMe()
  const { developer } = developerData || {}

  if (!developer) {
    return <div>Loading...</div>
  }

  const limit = BUG_LIMIT

  const columns = useMemo(() => createColumns(
    developer,
    (bug) => { setIsSubmitFixOpen(true); setSelectedBugId(bug.id) },
    (bug) => { setSelectedBugId(bug.id); handleUnclaim(bug) },
  ), [])

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
    return ["my-bugs", limit, offset, search, sorting?.id, sorting?.desc, statusFilter, difficultyFilter]
  }, [offset, search, sorting?.id, sorting?.desc, statusFilter, difficultyFilter])

  const { data, isLoading } = useQuery({
    queryFn: () => listBugs({
      queryParams: {
        developer_id: developer?.id,
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
    enabled: !!developer?.id,
  })

  const { mutate: unclaimBug, isPending: isUnclaiming } = useUnclaimBug(selectedBugId || "")

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

  const queryClient = useQueryClient()
  const prompt = usePrompt()

  const handleUnclaim = async (bug: Bug) => {
    const confirmed = await prompt({
      title: "Unclaim bug?",
      description: "Are you sure you want to unclaim this bug? It will be returned to the open pool for other developers to claim.",
      confirmText: "Unclaim",
      cancelText: "Cancel",
      variant: "confirmation",
    })

    if (!confirmed) return

    unclaimBug(undefined, {
      onSuccess: () => {
        toast.success("Bug unclaimed successfully")
        queryClient.invalidateQueries({ queryKey: ["bugs"] })
        setIsModalOpen(false)
        setSelectedBugId(null)
      },
      onError: (error) => {
        toast.error(`Failed to unclaim bug: ${error.message}`)
      },
    })
  }

  const handleSubmitFix = (bug: Bug) => {
    setIsModalOpen(false)
    setIsSubmitFixOpen(true)
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

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Bugs</h1>
      </div>
      <BugsListTemplate
        bugs={data?.response?.bugs || []}
        columns={columns as DataTableColumnDef<Bug>[]}
        rowCount={data ? data.response?.count : 0}
        isLoading={isLoading || isUnclaiming}
        onRowClick={handleRowClicked}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        search={search}
        setSearch={setSearch}
      />
      {selectedBugId && (
        <DeveloperBugDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bugId={selectedBugId}
          onSubmitFix={handleSubmitFix}
          onUnclaim={handleUnclaim}
          isUnclaiming={isUnclaiming}
        />
      )}
      {selectedBugId && (
        <SubmitFixModal
          isOpen={isSubmitFixOpen}
          onClose={() => setIsSubmitFixOpen(false)}
          bugId={selectedBugId}
        />
      )}
    </div>
  )
}
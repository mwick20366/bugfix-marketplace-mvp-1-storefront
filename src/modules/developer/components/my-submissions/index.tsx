"use client"
import {
  Submission,
  listSubmissions
} from "@lib/data/submissions"
import { Developer } from "@lib/data/developer"
import {
  createDataTableColumnHelper,
  DataTablePaginationState,
  DataTableSortingState,
  DataTableColumnDef,
} from "@medusajs/ui"
import BugsListTemplate from "@modules/bugs/components/list-template"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import SubmissionDetailsModal from "@modules/developer/components/submission-details-modal"
import SubmissionsListTemplate from "@modules/submissions/components/list-template"

const columnHelper = createDataTableColumnHelper<Submission>()

const SUBMISSION_LIMIT = 15

type MySubmissionsProps = {
  queryParams: {
    limit?: number
    offset?: number
    q?: string
  }
  developer: Developer
}

export default function MySubmissions(props: MySubmissionsProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { developer } = props

  const queryParams = {
    limit: SUBMISSION_LIMIT,
    developer_id: developer.id,
    // developerId: developer.id,
    // status: "claimed",
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
    return ["submissions", limit, offset, search, sorting?.id, sorting?.desc]
  }, [offset, search, sorting?.id, sorting?.desc])

  const { data, isLoading, refetch } = useQuery({
    queryFn: () => listSubmissions({
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
    // enabled: false, // Disable automatic fetching on mount
  })

  useEffect(() => {
    refetch()
    // Fetch data when component mounts or dependencies change
  }, [])

  const handleRowClicked = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubmission(null)
  }

  // const handleClaimBug = async () => {
  //   await claimBug(selectedSubmission!.id)

  //   console.log('Claiming bug with ID:', selectedSubmission?.id);

  //   setIsModalOpen(false)
  //   setSelectedSubmission(null)

  //   // refetch() // Refetch the list of bugs to reflect the claimed bug
  // }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Submissions</h1>
      </div>
      <SubmissionsListTemplate
        submissions={data?.response?.submissions || []}
        // columns={columns as DataTableColumnDef<Submission>[]}
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
      <SubmissionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        // onConfirm={handleClaimBug}
        submission={selectedSubmission!}
      />
    </div>
  )
}

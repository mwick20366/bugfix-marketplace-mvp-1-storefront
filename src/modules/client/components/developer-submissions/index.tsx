"use client"
import React from "react"
import {
  Submission,
  listSubmissions
} from "@lib/data/submissions"
import {
  DataTablePaginationState,
  DataTableSortingState,
  DataTableColumnDef,
  toast,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import SubmissionDetailsModal from "@modules/client/components/submission-details-modal"
import SubmissionsListTemplate from "@modules/submissions/components/list-template"
import { useClientMe } from "@lib/hooks/use-client-me"
import { clientStatusColumn, descriptionColumn, notesColumn, submittedColumn, titleColumn } from "@modules/submissions/components/list-template/columns"
import ApprovalModal from "@modules/approval/components/approval-modal"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const columns = [
  titleColumn,
  descriptionColumn,
  notesColumn,
  submittedColumn,
  clientStatusColumn,
]

const SUBMISSION_LIMIT = 15

export default function DeveloperSubmissions() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false)
  
  const { clientData } = useClientMe()

  const { client } = clientData || {}

  if (!client) {
    return <div className="py-12">Please log in to view your submissions.</div>
  }

  const queryParams = {
    limit: SUBMISSION_LIMIT,
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
    return ["developer-submissions", limit, offset, search, sorting?.id, sorting?.desc]
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

  const handleApprovalInitiated = () => {
    setIsDetailsModalOpen(false)
    setIsPaymentModalOpen(true)
  }

  const handleRowClicked = (submission: Submission) => {
    setSelectedSubmissionId(submission.id)
    setIsDetailsModalOpen(true)
  }

  useEffect(() => {
    const submissionId = searchParams.get("submissionId")
    if (submissionId) {
      setSelectedSubmissionId(submissionId)
      setIsDetailsModalOpen(true)
    }
  }, [searchParams])

  const handleApprovalFinalized = () => {
    toast.success("Submission approved and payment processed successfully!")
  }

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedSubmissionId(null)

    const params = new URLSearchParams(searchParams.toString())
    params.delete("submissionId")
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`text-2xl`}>Submissions</h1>
      </div>
      <SubmissionsListTemplate
        submissions={data?.response?.submissions || []}
        columns={columns as DataTableColumnDef<Submission>[]}
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
      {selectedSubmissionId && (
        <>
          <SubmissionDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseModal}
            onApprovalInitiated={handleApprovalInitiated}
            // onConfirm={handleClaimBug}
            submissionId={selectedSubmissionId}
          />
          <ApprovalModal
            submissionId={selectedSubmissionId || ""}
            developerId={selectedSubmissionId ? data?.response?.submissions.find(sub => sub.id === selectedSubmissionId)?.bug?.developer?.id || "" : ""}
            isOpen={isPaymentModalOpen}
            close={handleCloseModal}
            // clientSecret={clientSecret!}
            // paymentSession={paymentSession}
            onApprovalFinalized={handleApprovalFinalized}
          />
        </>
      )}
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { useMessageThreads, useMarkMessagesRead } from "@lib/hooks/use-messages"
import UnreadMessageBadge from "@modules/messaging/components/unread-message-badge"
import ClientBugDetailsModal from "@modules/client/components/bug-details-modal"
import ClientSubmissionDetailsModal from "@modules/client/components/submission-details-modal"
import { StatusBadge } from "@modules/common/components/bug-badges"
import { Bug } from "@lib/data/bugs"
import { Submission } from "@lib/data/submissions"
import { useQueryClient } from "@tanstack/react-query"

export default function MessagesPage() {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)

  const { bugs, submissions, isLoading } = useMessageThreads()

  const sortedBugs = useMemo(() => {
    return [...bugs].sort((a, b) => {
      const aDate = a.last_message_at || ""
      const bDate = b.last_message_at || ""
      return bDate.localeCompare(aDate)
    })
  }, [bugs])

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const aDate = a.last_message_at || ""
      const bDate = b.last_message_at || ""
      return bDate.localeCompare(aDate)
    })
  }, [submissions])

  if (isLoading) return <span className="text-sm text-ui-fg-subtle">Loading conversations...</span>

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>

      <div className="grid grid-cols-2 gap-x-6 items-start">
        {/* Left column: Bug threads */}
        <div>
          <h3 className="text-sm font-semibold text-ui-fg-base mb-2">Bugs</h3>
          {sortedBugs.length === 0 ? (
            <p className="text-sm text-ui-fg-subtle">No bug conversations.</p>
          ) : (
            <ul className="divide-y divide-ui-border-base">
              {sortedBugs.map((bug) => (
                <BugThreadRow
                  key={`bug-${bug.id}`}
                  bug={bug}
                  onOpen={() => { setSelectedBug(bug as Bug); setIsBugModalOpen(true) }}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Right column: Submission threads */}
        <div>
          <h3 className="text-sm font-semibold text-ui-fg-base mb-2">Submissions</h3>
          {sortedSubmissions.length === 0 ? (
            <p className="text-sm text-ui-fg-subtle">No submission conversations.</p>
          ) : (
            <ul className="divide-y divide-ui-border-base">
              {sortedSubmissions.map((submission) => (
                <SubmissionThreadRow
                  key={`submission-${submission.id}`}
                  submission={submission}
                  actorType="developer"
                  onOpen={() => { setSelectedSubmission(submission as Submission); setIsSubmissionModalOpen(true) }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedBug && (
        <ClientBugDetailsModal
          isOpen={isBugModalOpen}
          onClose={() => { setIsBugModalOpen(false); setSelectedBug(null) } }
          bug={selectedBug} onConfirm={function (): void {
            throw new Error("Function not implemented.")
          } } onEdit={function (bug: Bug): void {
            throw new Error("Function not implemented.")
          } } onDelete={function (bug: Bug): void {
            throw new Error("Function not implemented.")
          } }          // onSubmitFix={() => {}}
          // onUnclaim={() => {}}
        />
      )}

      {selectedSubmission && (
        <ClientSubmissionDetailsModal
          isOpen={isSubmissionModalOpen}
          onClose={() => { setIsSubmissionModalOpen(false); setSelectedSubmission(null) }}
          submission={selectedSubmission}
          // onConfirm={() => {}}
        />
      )}
    </div>
  )
}

function BugThreadRow({ bug, onOpen }: { bug: any; onOpen: () => void }) {
  const { mutate: markRead, isPending } = useMarkMessagesRead(bug.id, "developer", "bug")

  return (
    <li className="flex items-center justify-between py-4 px-2 hover:bg-ui-bg-subtle rounded-md">
      <div
        className="flex flex-col gap-y-1 flex-1 cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex items-center gap-x-2">
          {bug.has_unread && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white bg-blue-600 rounded px-1.5 py-0.5 leading-none">
              New!
            </span>
          )}
          <span className="text-sm font-medium">{bug.title}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <StatusBadge status={bug.status ?? ""} />
          {bug.developer?.first_name && (
            <span className="text-xs text-ui-fg-subtle">
              Developer: {bug.developer.first_name}
            </span>
          )}
        </div>
        {bug.last_message_at && (
          <span className="text-xs text-ui-fg-muted">
            {new Date(bug.last_message_at).toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-x-2 ml-2">
        {bug.has_unread && (
          <button
            onClick={(e) => { e.stopPropagation(); markRead() }}
            disabled={isPending}
            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
          >
            {isPending ? "Marking..." : "Mark as read"}
          </button>
        )}
        <UnreadMessageBadge bugId={bug.id} />
      </div>
    </li>
  )
}

function SubmissionThreadRow({
  submission,
  actorType,
  onOpen,
}: {
  submission: any
  actorType: "client" | "developer"
  onOpen: () => void
}) {
  const { mutate: markRead, isPending } = useMarkMessagesRead(submission.id, actorType, "submission")

  return (
    <li className="flex items-center justify-between py-4 px-2 hover:bg-ui-bg-subtle rounded-md">
      <div
        className="flex flex-col gap-y-1 flex-1 cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex items-center gap-x-2">
          {submission.has_unread && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white bg-blue-600 rounded px-1.5 py-0.5 leading-none">
              New!
            </span>
          )}
          <span className="text-sm font-medium">{submission.bug?.title}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <StatusBadge status={submission.status ?? ""} />
          {submission.developer?.first_name && (
            <span className="text-xs text-ui-fg-subtle">
              Developer: {submission.developer.first_name}
            </span>
          )}
        </div>
        {submission.last_message_at && (
          <span className="text-xs text-ui-fg-muted">
            {new Date(submission.last_message_at).toLocaleString()}
          </span>
        )}
      </div>
      {submission.has_unread && (
        <button
          onClick={(e) => { e.stopPropagation(); markRead() }}
          disabled={isPending}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50 ml-2"
        >
          {isPending ? "Marking..." : "Mark as read"}
        </button>
      )}
    </li>
  )
}
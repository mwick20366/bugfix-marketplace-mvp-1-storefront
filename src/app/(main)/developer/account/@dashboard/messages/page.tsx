"use client"

import { useState } from "react"
import { useMessageThreads } from "@lib/hooks/use-messages"
import UnreadMessageBadge from "@modules/messaging/components/unread-message-badge"
import { DeveloperBugDetailsModal } from "@modules/developer/components/bug-details-modal"
import { StatusBadge } from "@modules/common/components/bug-badges"
import { Bug } from "@lib/data/bugs"

export default function MessagesPage() {
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { bugs, isLoading } = useMessageThreads()

  if (isLoading) return <span className="text-sm text-ui-fg-subtle">Loading conversations...</span>

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>

      {bugs.length === 0 ? (
        <p className="text-sm text-ui-fg-subtle">No active conversations.</p>
      ) : (
        <ul className="divide-y divide-ui-border-base">
          {bugs.map((bug) => (
            <li
              key={bug.id}
              className="flex items-center justify-between py-4 px-2 cursor-pointer hover:bg-ui-bg-subtle rounded-md"
              onClick={() => {
                setSelectedBug(bug as Bug)
                setIsModalOpen(true)
              }}
            >
              <div className="flex flex-col gap-y-1">
                <span className="text-sm font-medium">{bug.title}</span>
                <div className="flex items-center gap-x-2">
                  <StatusBadge status={bug.status ?? ""} />
                  {bug.developer?.first_name && (
                    <span className="text-xs text-ui-fg-subtle">
                      Developer: {bug.developer.first_name}
                    </span>
                  )}
                </div>
              </div>
              <UnreadMessageBadge
                bugId={bug.id}
              />
            </li>
          ))}
        </ul>
      )}

      {selectedBug && (
        <DeveloperBugDetailsModal // swap for BugDetailsModal on developer side
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedBug(null) }}
          bug={selectedBug}
          onConfirm={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onReviewSubmission={() => {}}
          // ...other required props
        />
      )}
    </div>
  )
}
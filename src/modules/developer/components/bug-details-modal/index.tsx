// src/components/bugs/bug-details-modal.tsx
"use client"

import { Button } from "@medusajs/ui"
import { Bug, retrieveBug } from "@lib/data/bugs"
import Modal from "@modules/common/components/modal"
import { DetailRow } from "@modules/marketplace/components/bug-details-modal"
import { StatusBadge, DifficultyBadge } from "@modules/common/components/bug-badges"
import React, { useEffect } from "react"
import MessageThread from "@modules/messaging/components/message-thread"
import { useMarkMessagesRead } from "@lib/hooks/use-messages"
import { useQuery } from "@tanstack/react-query"

type DeveloperBugDetailsModalProps = {
  bug?: Bug
  bugId?: string
  isOpen: boolean
  onClose: () => void
  messageSectionHeight?: number
  onSubmitFix: (bug: Bug) => void
  onUnclaim: (bug: Bug) => void
  isUnclaiming?: boolean
}

export const DeveloperBugDetailsModal = ({
  bug: bugProp,
  bugId,
  isOpen,
  onClose,
  messageSectionHeight,
  onSubmitFix,
  onUnclaim,
  isUnclaiming,
}: DeveloperBugDetailsModalProps) => {
  if (!bugProp && !bugId) return null

  const { data: fetchedBugData, isLoading } = useQuery<{ bug: Bug }>({
    queryFn: async () => {
      const result = await retrieveBug(bugId || "");
      if (!result) throw new Error("Bug not found");
      return { bug: result };
    },
    queryKey: ["bug", bugId],
    enabled: !!bugId && !bugProp,
  });

  const bug = bugProp ?? fetchedBugData?.bug;

  const { mutate: markRead } = useMarkMessagesRead(bug?.id || bugId || "", "developer")

  useEffect(() => {
    if (isOpen && (bug?.id || bugId) && (bug?.status === "claimed" || bug?.status === "fix submitted")) {
      markRead()
    }
  }, [isOpen, bug?.id, bug?.status])

  const canSubmitFix = bug?.status === "claimed"
  const canUnclaim = bug?.status === "claimed"

  return (
    <Modal isOpen={isOpen && !!bug} close={onClose} size="large">
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        {/* Two-column details layout */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {/* Left column: title, description, repo, tech stack */}
          <div className="flex flex-col gap-y-2">
            <DetailRow label="Title">{bug?.title}</DetailRow>
            <DetailRow label="Description">{bug?.description}</DetailRow>
            {bug?.repo_link && (
              <DetailRow label="Repository URL">
                <a
                  href={bug.repo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  {bug.repo_link}
                </a>
              </DetailRow>
            )}
            {bug?.tech_stack && (
              <DetailRow label="Tech Stack">{bug.tech_stack}</DetailRow>
            )}            
          </div>

          {/* Right column: tech stack, bounty, difficulty, status */}
          <div className="flex flex-col gap-y-2">
            <DetailRow label="Bounty">${bug?.bounty}</DetailRow>
            <DetailRow label="Difficulty">
              <DifficultyBadge difficulty={bug?.difficulty ?? ""} />
            </DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={bug?.status ?? ""} />
            </DetailRow>
          </div>
        </div>

        {/* Attachments — spans both columns */}
        {bug?.attachments && bug.attachments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold mb-2">Attachments</p>
            <ul className="flex flex-col gap-y-1">
              {bug.attachments.map((attachment: any) => (
                <li key={attachment.id} className="flex items-center justify-between">
                  <span className="text-xs text-ui-fg-muted">{attachment.filename}</span>
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline ml-2"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Messages */}
        {bug && (bug.status === "claimed" || bug.status === "fix submitted") && (
          <div className="mt-4 border-t pt-4 flex flex-col" style={{ height: `${messageSectionHeight || 300}px` }}>
            <p className="text-sm font-semibold mb-2">Messages</p>
            <div className="flex-1 overflow-hidden">
              <MessageThread
                bugId={bug.id}
                currentUserId={bug?.developer?.id || ""}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer cancelLabel="Close">
        <Button
          variant="secondary"
          onClick={() => canUnclaim && onUnclaim(bug)}
          disabled={!canUnclaim}
          isLoading={isUnclaiming}
        >
          Unclaim
        </Button>
        <Button
          variant="primary"
          onClick={() => canSubmitFix && onSubmitFix(bug)}
          disabled={!canSubmitFix}
        >
          Submit Fix
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
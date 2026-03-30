// src/components/bugs/bug-details-modal.tsx
"use client"

import { Button, Label } from "@medusajs/ui"
import { Text as MedusaText } from "@medusajs/ui"
import { Bug } from "@lib/data/bugs"
import Modal from "@modules/common/components/modal" // your custom Modal wrapper

type BugDetailsModalProps = {
  bug: Bug | null
  isOpen: boolean
  onClose: () => void
  onSubmitFix: (bug: Bug) => void
  onUnclaim: (bug: Bug) => void
  isUnclaiming?: boolean
}

export const BugDetailsModal = ({
  bug,
  isOpen,
  onClose,
  onSubmitFix,
  onUnclaim,
  isUnclaiming,
}: BugDetailsModalProps) => {
  if (!bug) return null

  const canSubmitFix = bug.status === "claimed"
  const canUnclaim = bug.status === "claimed"

  return (
    <Modal isOpen={isOpen} close={onClose} size="medium">
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        <div className="flex flex-col gap-y-4">
          <div>
            <Label size="small" weight="plus">Title</Label>
            <MedusaText>{bug.title}</MedusaText>
          </div>
          <div>
            <Label size="small" weight="plus">Description</Label>
            <MedusaText>{bug.description}</MedusaText>
          </div>
          {bug.repoLink && (
            <div>
              <Label size="small" weight="plus">Repository URL</Label>
              <a
                href={bug.repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                {bug.repoLink}
              </a>
            </div>
          )}
          {bug.techStack && (
            <div>
              <Label size="small" weight="plus">Tech Stack</Label>
              <MedusaText>{bug.techStack}</MedusaText>
            </div>
          )}
          <div>
            <Label size="small" weight="plus">Bounty</Label>
            <MedusaText>${bug.bounty}</MedusaText>
          </div>
          <div>
            <Label size="small" weight="plus">Status</Label>
            <MedusaText>{bug.status}</MedusaText>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex items-center gap-x-2">
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
        </div>
      </Modal.Footer>
    </Modal>
  )
}
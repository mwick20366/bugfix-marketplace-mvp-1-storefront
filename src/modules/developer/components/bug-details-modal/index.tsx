// src/components/bugs/bug-details-modal.tsx
"use client"

import { Button } from "@medusajs/ui"
import { Bug } from "@lib/data/bugs"
import Modal from "@modules/common/components/modal"
import { DetailRow } from "@modules/marketplace/components/bug-details-modal"
import { StatusBadge, DifficultyBadge } from "@modules/common/components/bug-badges"
import React from "react"

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
        <div className="flex flex-col gap-y-2">
          <DetailRow label="Title">{bug.title}</DetailRow>
          <DetailRow label="Description">{bug.description}</DetailRow>
          {bug.repo_link && (
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
          {bug.tech_stack && (
            <DetailRow label="Tech Stack">{bug.tech_stack}</DetailRow>
          )}
          <DetailRow label="Bounty">${bug.bounty}</DetailRow>
          <DetailRow label="Difficulty">
            <DifficultyBadge difficulty={bug.difficulty ?? ""} />
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={bug.status ?? ""} />
          </DetailRow>
        </div>
      </Modal.Body>
      <Modal.Footer>
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
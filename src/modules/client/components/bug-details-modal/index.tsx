"use client";

import { Bug } from "@lib/data/bugs";
import { Button, Tooltip } from "@medusajs/ui";
import { DifficultyBadge, StatusBadge } from "@modules/common/components/bug-badges";
import Modal from "@modules/common/components/modal";
import { DetailRow } from "@modules/marketplace/components/bug-details-modal";

interface BugDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bug: Bug;
  onReviewSubmission?: () => void;
  onEdit: (bug: Bug) => void;
  onDelete: (bug: Bug) => void;
}

export default function ClientBugDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  bug,
  onReviewSubmission,
  onEdit,
  onDelete,
}: BugDetailsModalProps) {
  const canDelete = bug?.status === "open";

const deleteButton = (
  <Button
    variant="danger"
    onClick={() => canDelete && onDelete(bug)}
    disabled={!canDelete}
  >
    Delete
  </Button>
);

  return (
    <Modal isOpen={isOpen} close={onClose} size="medium">
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        <div className="flex flex-col gap-y-2">
          <DetailRow label="Title">{bug?.title}</DetailRow>
          <DetailRow label="Description">{bug?.description}</DetailRow>
          <DetailRow label="Repo">
            <a
              href={bug?.repo_link}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              {bug?.repo_link}
            </a>
          </DetailRow>
          <DetailRow label="Bounty">${bug?.bounty}</DetailRow>
          <DetailRow label="Difficulty">
            <DifficultyBadge difficulty={bug?.difficulty ?? ""} />
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={bug?.status ?? ""} />
          </DetailRow>

          {bug?.status === "claimed" && bug?.claimed_at && (
            <DetailRow label="Claimed On">
              {new Date(bug.claimed_at).toLocaleDateString()}
              {bug?.developer?.first_name && ` by ${bug.developer.first_name}`}
            </DetailRow>
          )}

          {bug?.status === "fix submitted" && bug?.submissions?.[0]?.created_at && (
            <DetailRow label="Submitted On">
              {new Date(bug.submissions[0].created_at).toLocaleDateString()}
              {bug?.developer?.first_name && ` by ${bug.developer.first_name}`}
            </DetailRow>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {/* Edit and Delete buttons on the left */}
        <div className="flex items-center gap-x-2 mr-auto">
          <Button
            variant="primary"
            onClick={() => onEdit(bug)}
          >
            Edit
          </Button>
          {canDelete ? (
            deleteButton
          ) : (
            <Tooltip content="You can only delete open bugs">
              {deleteButton}
            </Tooltip>
          )}
        </div>

        {/* Review Submission button on the right */}
        {bug?.status === "fix submitted" && (
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onReviewSubmission?.();
            }}
          >
            Review Submission
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
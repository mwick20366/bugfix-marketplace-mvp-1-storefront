"use client";

import { Bug, retrieveBug } from "@lib/data/bugs";
import { useMarkMessagesRead } from "@lib/hooks/use-messages";
import { Button, Tooltip } from "@medusajs/ui";
import { DifficultyBadge, StatusBadge } from "@modules/common/components/bug-badges";
import Modal from "@modules/common/components/modal";
import { DetailRow } from "@modules/marketplace/components/bug-details-modal";
import MessageThread from "@modules/messaging/components/message-thread";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ClientBugDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  messageSectionHeight?: number;
  bug?: Bug;
  bugId?: string;
  onReviewSubmission?: (submissionId: string) => void;
  onEdit: (bug: Bug) => void;
  onDelete: (bug: Bug) => void;
}

export default function ClientBugDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  messageSectionHeight,
  bug: bugProp,
  bugId,
  onReviewSubmission,
  onEdit,
  onDelete,
}: ClientBugDetailsModalProps) {
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

  const { mutate: markRead } = useMarkMessagesRead(bug?.id || bugId || "", "client")

  useEffect(() => {
    if (isOpen && (bug?.id || bugId) && (bug?.status === "claimed" || bug?.status === "fix submitted")) {
      markRead()
    }
  }, [isOpen, bug?.id, bug?.status])

  const canDelete = bug?.status === "open";

  const deleteButton = (
    <Button
      variant="danger"
      onClick={() => canDelete && onDelete(bug?.id ? bug : { ...bug, id: bugId } as Bug)}
      disabled={!canDelete}
    >
      Delete
    </Button>
  );

  return (
    <Modal isOpen={isOpen && !!bug} close={onClose} size="large">
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        {/* Two-column details layout */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {/* Left column: title, description, repo, claimed/submitted info */}
          <div className="flex flex-col gap-y-2">
            <DetailRow label="Title">{bug?.title}</DetailRow>
            <DetailRow label="Description">{bug?.description}</DetailRow>
            {bug?.repo_link && (
              <DetailRow label="Repo">
                <a
                  href={bug.repo_link}
                  className="text-blue-600 underline text-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  {bug.repo_link}
                </a>
              </DetailRow>
            )}
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

          {/* Right column: bounty, difficulty, status */}
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
        {(bug && (bug.status === "claimed" || bug.status === "fix submitted")) && (
          <div className="mt-4 border-t pt-4 flex flex-col" style={{ height: `${messageSectionHeight || 333}px` }}>
            <p className="text-sm font-semibold mb-2">Messages</p>
            <div className="flex-1 overflow-hidden">
              <MessageThread
                bugId={bug.id || bugId}
                currentUserId={bug.client?.id || ""}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer cancelLabel="Close">
        <div className="flex items-center gap-x-2 mr-auto">
          <Button
            variant="primary"
            onClick={() => onEdit(bug?.id ? bug : { ...bug, id: bugId } as Bug)}
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

        {bug?.status === "fix submitted" && (
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onReviewSubmission?.(bug?.submissions?.[0]?.id || "");
            }}
          >
            Review Submission
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
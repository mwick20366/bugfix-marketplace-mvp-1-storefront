"use client";

import { Submission } from "@lib/data/submissions";
import { Button, Heading } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@lib/config";
import { DetailRow } from "@modules/marketplace/components/bug-details-modal";
import MessageThread from "@modules/messaging/components/message-thread";
import { useMarkMessagesRead } from "@lib/hooks/use-messages";
import { useEffect } from "react";

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalInitiated?: () => void;
  onReject?: () => void;
  submission?: Submission;
  submissionId?: string;
  messageSectionHeight?: number;
}

export default function SubmissionDetailsModal({ 
  isOpen, 
  onClose = () => {}, 
  onApprovalInitiated = () => {}, 
  onReject = () => {},
  submission: submissionProp,
  submissionId,
  messageSectionHeight,
}: SubmissionDetailsModalProps) {
  const { data: fetchedSubmissionData, isLoading } = useQuery<{ submission: Submission }>({
    queryFn: () =>
      sdk.client.fetch(`/submissions/${submissionId}`, {
        method: "GET",
      }),
    queryKey: ["submission", submissionId],
    enabled: !!submissionId && !submissionProp,
  });

  const submission = submissionProp ?? fetchedSubmissionData?.submission;

  const { mutate: markRead } = useMarkMessagesRead(
    submission?.id || submissionId || "",
    "client",
    "submission"
  )

  useEffect(() => {
    if (isOpen && (submission?.id || submissionId) && submission?.status === "awaiting client review") {
      markRead()
    }
  }, [isOpen, submission?.id, submission?.status])

  const displayButtons = () => {
    if (submission?.status === "awaiting client review") {
      return (
        <Button type="button" variant="primary" onClick={() => onApprovalInitiated()}>
          Approve
        </Button>
      )
    }
    return null
  }

  return (
    <Modal isOpen={isOpen && !!submission} close={onClose}>
      <Modal.Title>Submission Details</Modal.Title>
      <Modal.Body>
        <Heading level="h2">{submission?.bug?.title}</Heading>
        <div className="flex flex-col gap-y-2 mt-2">
          <DetailRow label="Bug Description">{submission?.bug?.description}</DetailRow>
          <DetailRow label="Bounty">${submission?.bug?.bounty}</DetailRow>
          <DetailRow label="Fix Description">{submission?.notes}</DetailRow>
          {submission?.file_url && (
            <DetailRow label="File URL">
              <a
                href={submission.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                {submission.file_url}
              </a>
            </DetailRow>
          )}
          {submission?.client_notes && (
            <DetailRow label="Notes">{submission.client_notes}</DetailRow>
          )}
        </div>

        {/* Attachments */}
        {submission?.attachments && submission.attachments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold mb-2">Attachments</p>
            <ul className="flex flex-col gap-y-1">
              {submission.attachments.map((attachment: any) => (
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
        {submission && submission.status === "awaiting client review" && (
          <div className="mt-4 border-t pt-4 flex flex-col" style={{ height: `${messageSectionHeight || 300}px` }}>
            <p className="text-sm font-semibold mb-2">Messages</p>
            <div className="flex-1 overflow-hidden">
              <MessageThread
                submissionId={submission.id || ""}
                currentUserId={submission.bug?.client?.id || ""}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer cancelLabel="Close">
        <div className="flex items-center gap-x-2">
          {displayButtons()}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
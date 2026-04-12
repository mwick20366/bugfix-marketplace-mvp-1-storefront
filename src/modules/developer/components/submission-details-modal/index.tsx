"use client";

import { sdk } from "@lib/config";
import { Submission } from "@lib/data/submissions";
import { Button, Heading, Label, Text as BugzapperText, StatusBadge } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { useQuery } from "@tanstack/react-query";

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  submission?: Submission; // Optional: show which submission is being claimed
  submissionId?: string; // Optional: if submission details are fetched via ID
}

export default function SubmissionDetailsModal({ 
  isOpen, 
  onClose = () => {}, 
  onConfirm = () => {},
  submission: submissionProp,
  submissionId,
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

  return (
    <Modal isOpen={isOpen && !!submission} close={onClose}>
      <Modal.Title>Submission Details</Modal.Title>
      <Modal.Body>
        <Heading level="h2">{submission?.bug?.title}</Heading>
        <div className="flex flex-col gap-y-2">
          <Label>Bug Description</Label>
          <BugzapperText>{submission?.bug?.description}</BugzapperText>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Bounty</Label>
          <BugzapperText>${submission?.bug?.bounty}</BugzapperText>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Fix Description</Label>
          <BugzapperText>{submission?.notes}</BugzapperText>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>File URL</Label>
          <a href={submission?.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {submission?.file_url}
          </a>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Status</Label>
          <StatusBadge>{submission?.status}</StatusBadge>
        </div>
        {submission?.client_notes && (
          <div className="flex flex-col gap-y-2">
            <Label>Client Notes</Label>
            <BugzapperText>{submission.client_notes}</BugzapperText>
          </div>
        )}        
      </Modal.Body>
      <Modal.Footer>
        <div className="flex items-center gap-x-2">
          {submission?.status === "client approved" && (
            <Button
              variant="primary"
              onClick={onConfirm}
            >
              Get Paid! (${submission?.bug?.bounty})
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

"use client";

import { Submission } from "@lib/data/submissions";
import { Button, Heading, Label, Text as MedusaText } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  submission: Submission; // Optional: show which submission is being claimed
}

export default function SubmissionDetailsModal({ 
  isOpen, 
  onClose = () => {}, 
  onConfirm = () => {},
  submission,
}: SubmissionDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} close={onClose}>
      <Modal.Title>Submission Details</Modal.Title>
      <Modal.Body>
        <Heading level="h2">{submission?.bug?.title}</Heading>
        <div className="flex flex-col gap-y-2">
            <Label>Bug Description</Label>
            <MedusaText>{submission?.bug?.description}</MedusaText>
        </div>
        <div className="flex flex-col gap-y-2">
            <Label>Bounty</Label>
            <MedusaText>${submission?.bug?.bounty}</MedusaText>
        </div>
        <div className="flex flex-col gap-y-2">
            <Label>Fix Description</Label>
            <MedusaText>{submission?.notes}</MedusaText>
        </div>
        <div className="flex flex-col gap-y-2">
            <Label>File URL</Label>
            <a href={submission?.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {submission?.fileUrl}
            </a>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Status</Label>
          <MedusaText>{submission?.status}</MedusaText>
        </div>
        {submission?.clientNotes && (
          <div className="flex flex-col gap-y-2">
            <Label>Client Notes</Label>
            <MedusaText>{submission.clientNotes}</MedusaText>
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

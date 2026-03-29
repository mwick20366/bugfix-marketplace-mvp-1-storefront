"use client";

import { Bug } from "@lib/data/bugs";
import {
  Button,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast
} from "@medusajs/ui";
import { useState } from "react";
import { useSubmitFix } from "@lib/hooks/use-submit-fix";
import Modal from "@modules/common/components/modal";

interface BugDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixSubmitted?: () => void;
  bug: Bug; // Optional: show which bug is being claimed
}

export default function BugDetailsModal({ 
  isOpen, 
  onClose, 
  bug,
  onFixSubmitted,
  // bugTitle = "this bug" 
}: BugDetailsModalProps) {
  const [notes, setNotes] = useState("")
  const [fileUrl, setFileUrl] = useState("")

  const { mutate: submitFix, isPending } = useSubmitFix(bug?.id)

  const handleSubmit = () => {
    submitFix({ notes, fileUrl }, {
      onSuccess: () => {
        toast.success("Fix submitted successfully")
        onFixSubmitted?.()
        onClose()
      },
      onError: (error) => {
        toast.error(`Failed to submit fix: ${error.message}`)
      },
    })
  }

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <Modal.Title>Submit Bug Fix</Modal.Title>
      <Modal.Body>
        <Heading level="h2">{bug?.title}</Heading>
        <Text>{bug?.description}</Text>
        <Text>Bounty: {bug?.bounty}</Text>
        <div className="flex flex-col gap-y-2">
          <Label>Fix Description</Label>
          <Textarea
            placeholder="Describe your fix..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>File URL</Label>
          <Input
            placeholder="Enter the file URL..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
        </div>          
      </Modal.Body>
      <Modal.Footer>
        <div className="flex items-center gap-x-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!fileUrl || !notes}
          >
            Submit Fix
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

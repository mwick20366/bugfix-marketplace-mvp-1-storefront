"use client";

import { Bug } from "@lib/data/bugs";
import {
  Button,
  FocusModal,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast
} from "@medusajs/ui";
import { useState } from "react";
import { useSubmitFix } from "@lib/hooks/use-submit-fix";

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
    <FocusModal
      open={isOpen}
      onOpenChange={onClose}
    >
      <FocusModal.Content
        className="w-[50vw] max-w-[50vw] h-[50vh] max-h-[50vh] m-auto flex flex-col"
      >
        {/* <FocusModal.Header>
          <Heading level="h1">Submit Bug Fix</Heading>
        </FocusModal.Header> */}
        <FocusModal.Body
          className="flex flex-col gap-4 p-6"
        >
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
        </FocusModal.Body>
        <FocusModal.Footer>
          <div className="flex items-center gap-x-2">
            <FocusModal.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </FocusModal.Close>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isPending}
              disabled={!fileUrl || !notes}
            >
              Submit Fix
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

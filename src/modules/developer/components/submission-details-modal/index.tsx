"use client";

import { sdk } from "@lib/config";
import { Submission } from "@lib/data/submissions";
import { Button, Heading, Label, StatusBadge, toast } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { DetailRow } from "@modules/marketplace/components/bug-details-modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { createSubmissionAttachment, deleteSubmissionAttachment } from "@lib/data/submission-attachments";
import { useMarkMessagesRead } from "@lib/hooks/use-messages";
import MessageThread from "@modules/messaging/components/message-thread";

type Attachment = {
  id: string
  file_id: string
  file_url: string
  filename: string
}

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  submission?: Submission;
  submissionId?: string;
}

export default function SubmissionDetailsModal({ 
  isOpen, 
  onClose = () => {}, 
  onConfirm = () => {},
  submission: submissionProp,
  submissionId,
}: SubmissionDetailsModalProps) {
  const queryClient = useQueryClient()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Set<string>>(new Set())
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false)

  const { data: fetchedSubmissionData, isLoading } = useQuery<{ submission: Submission }>({
    queryFn: () =>
      sdk.client.fetch(`/submissions/${submissionId}`, {
        method: "GET",
      }),
    queryKey: ["submission", submissionId],
    enabled: !!submissionId && !submissionProp,
  });

  const submission = submissionProp ?? fetchedSubmissionData?.submission;
  const isApproved = submission?.status === "client approved"

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPendingFiles([])
      setAttachmentsToDelete(new Set())
    }
  }, [isOpen])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/zip": [],
      "application/x-zip-compressed": [],
    },
    multiple: true,
  })

  const markForDeletion = (attachmentId: string) => {
    setAttachmentsToDelete((prev) => new Set(prev).add(attachmentId))
  }

  const unmarkForDeletion = (attachmentId: string) => {
    setAttachmentsToDelete((prev) => {
      const next = new Set(prev)
      next.delete(attachmentId)
      return next
    })
  }

  const handleSaveAttachments = async () => {
    const submissionId = submission?.id
    if (!submissionId) return

    if (pendingFiles.length > 0) {
      setIsUploadingAttachments(true)
      try {
        await createSubmissionAttachment({ submissionId, files: pendingFiles })
      } catch {
        toast.error("Failed to upload attachments")
      } finally {
        setIsUploadingAttachments(false)
      }
    }

    if (attachmentsToDelete.size > 0) {
      await Promise.all(
        Array.from(attachmentsToDelete).map((id) => deleteSubmissionAttachment(id))
      )
    }

    queryClient.invalidateQueries({ queryKey: ["submission", submissionId] })
    queryClient.invalidateQueries({ queryKey: ["my-submissions"] })
    toast.success("Attachments updated successfully")
    setPendingFiles([])
    setAttachmentsToDelete(new Set())
  }

  const existingAttachments: Attachment[] = (submission as any)?.attachments || []
  const visibleAttachments = existingAttachments.filter(
    (a) => !attachmentsToDelete.has(a.id)
  )

  const hasAttachmentChanges = pendingFiles.length > 0 || attachmentsToDelete.size > 0

  const { mutate: markRead } = useMarkMessagesRead(submission?.id || submissionId || "", "developer", "submission")

  useEffect(() => {
    if (isOpen && submission?.id) {
      markRead()
    }
  }, [isOpen, submission?.id, submission?.status])

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
          <DetailRow label="Status">
            <StatusBadge>{submission?.status}</StatusBadge>
          </DetailRow>
          {submission?.client_notes && (
            <DetailRow label="Client Notes">{submission.client_notes}</DetailRow>
          )}
        </div>

        {/* Attachments Section */}
        <div className="mt-4 border-t pt-4 flex flex-col gap-y-2">
          <Label size="small" weight="plus">Attachments</Label>

          {isApproved ? (
            // Read-only: just show download links
            existingAttachments.length > 0 ? (
              <ul className="flex flex-col gap-y-1">
                {existingAttachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between">
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-ui-fg-interactive underline"
                    >
                      {attachment.filename || attachment.file_url.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ui-fg-muted">No attachments</p>
            )
          ) : (
            // Editable: show remove/undo, dropzone, and pending files
            <>
              {!isLoading && visibleAttachments.length > 0 && (
                <ul className="flex flex-col gap-y-1 mb-2">
                  {visibleAttachments.map((attachment) => (
                    <li key={attachment.id} className="flex items-center justify-between">
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-ui-fg-interactive underline"
                      >
                        {attachment.filename || attachment.file_url.split("/").pop()}
                      </a>
                      <button
                        type="button"
                        onClick={() => markForDeletion(attachment.id)}
                        className="text-xs text-red-500 hover:text-red-700 ml-2"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {attachmentsToDelete.size > 0 && (
                <ul className="flex flex-col gap-y-1 mb-2">
                  {existingAttachments
                    .filter((a) => attachmentsToDelete.has(a.id))
                    .map((attachment) => (
                      <li key={attachment.id} className="flex items-center justify-between opacity-50">
                        <span className="text-xs text-ui-fg-muted line-through">
                          {attachment.filename || attachment.file_url.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => unmarkForDeletion(attachment.id)}
                          className="text-xs text-ui-fg-muted hover:text-ui-fg-base ml-2"
                        >
                          Undo
                        </button>
                      </li>
                    ))}
                </ul>
              )}

              <div
                {...getRootProps()}
                className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-ui-border-interactive bg-ui-bg-subtle"
                    : "border-ui-border-strong bg-ui-bg-component"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-ui-fg-muted">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag and drop files here, or click to select"}
                </p>
              </div>

              {pendingFiles.length > 0 && (
                <ul className="mt-2 flex flex-col gap-y-1">
                  {pendingFiles.map((file, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-xs text-ui-fg-muted">{file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-xs text-ui-fg-muted hover:text-ui-fg-base ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        {submission && (
          <div className="mt-4 border-t pt-4 flex flex-col" style={{ height: "300px" }}>
            <p className="text-sm font-semibold mb-2">Messages</p>
            <div className="flex-1 overflow-hidden">
              <MessageThread
                submissionId={submission?.id || ""}
                currentUserId={submission?.developer?.id || ""}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer showCancel={false}>
        <div className="flex items-center justify-between w-full">
          <div>
            {!isApproved && hasAttachmentChanges && (
              <Button
                variant="secondary"
                onClick={handleSaveAttachments}
                isLoading={isUploadingAttachments}
              >
                Save Attachments
              </Button>
            )}
          </div>
          <div>
            {isApproved && (
              <Button variant="primary" onClick={onConfirm}>
                Get Paid! (${submission?.bug?.bounty})
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
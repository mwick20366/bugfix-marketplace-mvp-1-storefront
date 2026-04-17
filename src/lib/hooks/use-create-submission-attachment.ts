"use client"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createSubmissionAttachment } from "@lib/data/submission-attachments"

type CreateSubmissionAttachmentInput = {
  submissionId: string
  files: File[]
}

type CreateSubmissionAttachmentResult = {
  files: { id: string; url: string }[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB — adjust as needed

export const useCreateSubmissionAttachment = (
  options?: UseMutationOptions<
    CreateSubmissionAttachmentResult,
    Error,
    CreateSubmissionAttachmentInput
  >
) => {
  return useMutation({
    mutationFn: ({ submissionId, files }: CreateSubmissionAttachmentInput) => {
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `File "${file.name}" exceeds the maximum allowed size of 10MB.`
          )
        }
      }
      return createSubmissionAttachment({ submissionId, files })
    },
    ...options,
  })
}
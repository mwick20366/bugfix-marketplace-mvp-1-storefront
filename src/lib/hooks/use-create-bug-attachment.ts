"use client"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createBugAttachment } from "@lib/data/bug-attachments"

type CreateBugAttachmentInput = {
  bugId: string
  files: File[]
}

type CreateBugAttachmentResult = {
  files: { id: string; url: string }[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB — adjust as needed

export const useCreateBugAttachment = (
  options?: UseMutationOptions<
    CreateBugAttachmentResult,
    Error,
    CreateBugAttachmentInput
  >
) => {
  return useMutation({
    mutationFn: ({ bugId, files }: CreateBugAttachmentInput) => {
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `File "${file.name}" exceeds the maximum allowed size of 10MB.`
          )
        }
      }
      return createBugAttachment({ bugId, files })
    },
    ...options,
  })
}
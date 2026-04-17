import { getAuthToken } from "./auth-token";

export const createSubmissionAttachment = async ({
  submissionId,
  files,
}: {
  submissionId: string
  files: File[]
}): Promise<{ files: { id: string; url: string }[] }> => {
  const token = await getAuthToken()
  
  const fd = new FormData()
  files.forEach((file) => fd.append("files", file))

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/submissions/attachments?submission_id=${submissionId}`,
    {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )

  return response.json()
}

export const deleteSubmissionAttachment = async (attachmentId: string): Promise<void> => {
  const token = await getAuthToken()

  await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/submissions/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
}
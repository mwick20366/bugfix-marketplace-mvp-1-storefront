import { getAuthToken } from "./auth-token";

export const createBugAttachment = async ({
  bugId,
  files,
}: {
  bugId: string
  files: File[]
}): Promise<{ files: { id: string; url: string }[] }> => {
  const token = await getAuthToken()
  
  const fd = new FormData()
  files.forEach((file) => fd.append("files", file))

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/bugs/attachments?bug_id=${bugId}`,
    {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      // credentials: "include", // sends cookies automatically
    }
  )

  return response.json()
}

export const deleteBugAttachment = async (attachmentId: string): Promise<void> => {
  const token = await getAuthToken()

  await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/bugs/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
}
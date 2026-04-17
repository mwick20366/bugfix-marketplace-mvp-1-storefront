"use client"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createBug } from "@lib/data/bugs"
import { CreateBugSchema } from "@modules/bugs/components/create-bug/validators"

type CreateBugInput = CreateBugSchema & {
  attachments?: {
    file_id: string
    file_url: string
    filename: string
  }[]
}

export const useCreateBug = (
  clientId: string,
  options?: UseMutationOptions<any, any, CreateBugInput>
) => {
  return useMutation({
    mutationFn: ({
      title,
      description,
      tech_stack,
      repo_link,
      bounty,
      difficulty,
      attachments,
    }: CreateBugInput) =>
      createBug({
        title,
        description,
        tech_stack,
        repo_link,
        bounty,
        clientId,
        difficulty,
        attachments,
      }),
    ...options,
  })
}
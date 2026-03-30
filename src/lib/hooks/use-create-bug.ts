"use client"
import { QueryClient, useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createBug } from "@lib/data/bugs"
import { CreateBugSchema } from "@modules/bugs/components/create-bug/validators"

export const useCreateBug = (clientId: string, options?: UseMutationOptions<any, any, CreateBugSchema>)  => {
  const queryClient = new QueryClient()
  
  return useMutation({
    mutationFn: (
      {
        title,
        description,
        techStack,
        repoLink,
        bounty,
      }: CreateBugSchema
    ) => createBug({ title, description, techStack, repoLink, bounty, clientId }),
    onSuccess: (data: any, variables: any, context: any, meta: any) => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] })
      // Forward to hook-level consumer's onSuccess
      options?.onSuccess?.(data, variables, context, meta)
    },
    ...options
  })
}

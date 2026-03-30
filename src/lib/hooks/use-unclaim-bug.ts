"use client"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { unclaimBug } from "@lib/data/bugs"

export const useUnclaimBug = (bugId: string, options?: UseMutationOptions) => {
  return useMutation({
    mutationFn: () => unclaimBug(bugId),
    onSuccess: (data: any, variables: any, context: any, meta: any) => {
      // Forward to hook-level consumer's onSuccess
      options?.onSuccess?.(data, variables, context, meta)
    },
    ...options
  })
}
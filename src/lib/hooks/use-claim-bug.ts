"use client"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { claimBug } from "@lib/data/bugs"

export const useClaimBug = (bugId: string, options?: UseMutationOptions) => {
  return useMutation({
    mutationFn: () => claimBug(bugId),
    onSuccess: (data: any, variables: any, context: any, meta: any) => {
      // Forward to hook-level consumer's onSuccess
      options?.onSuccess?.(data, variables, context, meta)
    },
    ...options
  })
}
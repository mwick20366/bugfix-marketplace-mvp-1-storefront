"use client"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { submitFix } from "@lib/data/bugs"
import { SubmitFixSchema } from "@modules/developer/components/bug-details-modal/validators"

export const useSubmitFix = (bugId: string, options?: UseMutationOptions<any, any, SubmitFixSchema>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ notes, fileUrl }: { notes: string; fileUrl: string }) =>
      submitFix(notes, fileUrl, bugId),
    onSuccess: (data: any, variables: any, context: any, meta: any) => {
      options?.onSuccess?.(data, variables, context, meta)
    },
    ...options,
  })
}
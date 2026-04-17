"use client"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { submitFix } from "@lib/data/bugs"
import { SubmitFixSchema } from "@modules/developer/components/bug-details-modal/validators"

export const useSubmitFix = (bugId: string, options?: UseMutationOptions<any, any, SubmitFixSchema>) => {
  return useMutation({
    mutationFn: ({ notes, file_url }: { notes: string; file_url: string }) =>
      submitFix(notes, file_url, bugId),
    onSuccess: (data: any, variables: any, context: any, meta: any) => {
      options?.onSuccess?.(data, variables, context, meta)
    },
    ...options,
  })
}
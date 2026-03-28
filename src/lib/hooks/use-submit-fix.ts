"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { submitFix } from "@lib/data/bugs"

export const useSubmitFix = (bugId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ notes, fileUrl }: { notes: string; fileUrl: string }) =>
      submitFix(notes, fileUrl, bugId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bugs"] })
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] })
      queryClient.invalidateQueries({ queryKey: ["developer-me"] })
    },
  })
}
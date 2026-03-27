"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { claimBug } from "@lib/data/bugs"

export const useClaimBug = (bugId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => claimBug(bugId),
    onSuccess: () => {
      // Invalidate the bugs list — TanStack Query will re-fetch automatically
      queryClient.invalidateQueries({
        queryKey: ["bugs"],
      })
    },
  })
}
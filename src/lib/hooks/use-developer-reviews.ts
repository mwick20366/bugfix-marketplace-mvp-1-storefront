"use client"
import { useQuery } from "@tanstack/react-query"
import { DeveloperReview, retrieveDeveloperReviews } from "@lib/data/developer"

export const useDeveloperReviews = () => {
  const result = useQuery({
    queryFn: () => retrieveDeveloperReviews().catch(() => null),
    queryKey: ["developer-reviews"],
    staleTime: 0,
  })

  return {
    ...result,
    developerReviews: (result.data ?? null) as DeveloperReview[] | null,
  }
}

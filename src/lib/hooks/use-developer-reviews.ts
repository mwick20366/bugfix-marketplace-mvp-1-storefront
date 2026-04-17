"use client"
import { useQuery } from "@tanstack/react-query"
import { DeveloperReviewResponse, retrieveDeveloperReviews } from "@lib/data/developer"

export const useDeveloperReviews = () => {
  const result = useQuery({
    queryFn: () => retrieveDeveloperReviews(),
    queryKey: ["developer-reviews"],
  })

  return {
    ...result,
    developerReviews: result.data as DeveloperReviewResponse,
  }
}

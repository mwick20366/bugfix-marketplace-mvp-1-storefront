"use client"

import { useDeveloperReviews } from "@lib/hooks/use-developer-reviews"
import { StarSolid, Star } from "@medusajs/icons"

export default function DeveloperMyReviews() {
  const { data, isLoading } = useDeveloperReviews()

  return (
    <div className="py-12">
      <div className="content-container flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ui-fg-base">My Reviews</h1>
        </div>

        {isLoading && <p className="text-ui-fg-muted text-sm">Loading...</p>}

        {!isLoading && data?.reviews.length === 0 && (
          <p className="text-ui-fg-muted text-sm">You have no reviews yet.</p>
        )}

        {data?.reviews.map((review) => (
          <div
            key={review.id}
            className="flex items-start justify-between p-4 rounded-lg border border-ui-border-base bg-ui-bg-base"
          >
            <div className="flex flex-col gap-y-2">
              <div className="flex gap-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>
                    {index < review.rating ? (
                      <StarSolid className="text-ui-tag-orange-icon" />
                    ) : (
                      <Star />
                    )}
                  </span>
                ))}
              </div>
              {review.notes && (
                <p className="text-ui-fg-base text-sm">{review.notes}</p>
              )}
              <p className="text-ui-fg-muted text-xs">
                {new Date(review.created_at).toDateString()}
              </p>
              {review.client && (
                <p className="text-ui-fg-subtle text-xs">
                  From: {review.client.contact_first_name} ({review.client.company_name})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
// src/app/developer/account/notifications/page.tsx
"use client"

import { useClientNotifications, useMarkNotificationRead } from "@lib/hooks/use-notifications"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ClientNotificationsPage() {
  const { data, isLoading } = useClientNotifications({ order: "-created_at" })
  const { mutate: markRead } = useMarkNotificationRead("client")

  const notificationLink = (n: any) => {
    if (n.resource_type === "bug") {
      return `/client/account/my-bugs?bugId=${n.resource_id}`
    }

    if (n.resource_type === "submission") {
      return `/client/account/developer-submissions?submissionId=${n.resource_id}`
    }

    return n.resource_url || "#"
  }

  return (
    <div className="py-12">
      <div className="content-container flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold text-ui-fg-base">Notifications</h1>

        {isLoading && <p className="text-ui-fg-muted text-sm">Loading...</p>}

        {!isLoading && data?.notifications?.length === 0 && (
          <p className="text-ui-fg-muted text-sm">You have no notifications.</p>
        )}

        {data?.notifications?.map((n) => (
          <div
            key={n.id}
            className={`flex items-start justify-between p-4 rounded-lg border ${
              n.is_read
                ? "border-ui-border-base bg-ui-bg-base"
                : "border-ui-border-base bg-ui-bg-subtle"
            }`}
          >
            <div className="flex flex-col gap-y-1">
              <p className="text-ui-fg-base text-sm">{n.message}</p>
              <p className="text-ui-fg-muted text-xs">
                {new Date(n.created_at).toDateString()}
              </p>
              {n.resource_id && (
                <LocalizedClientLink
                  href={notificationLink(n)}
                  className="text-ui-fg-interactive text-xs"
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  View details →
                </LocalizedClientLink>
              )}
            </div>
            {!n.is_read && (
              <button
                onClick={() => markRead(n.id)}
                className="text-xs text-ui-fg-muted hover:text-ui-fg-base shrink-0 ml-4"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
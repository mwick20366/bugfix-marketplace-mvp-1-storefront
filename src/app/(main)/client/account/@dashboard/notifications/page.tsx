// src/app/developer/account/notifications/page.tsx
"use client"

import { useClientNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@lib/hooks/use-notifications"
import Link from "next/dist/client/link"

export default function ClientNotificationsPage() {
  const { data, isLoading } = useClientNotifications({ order: "-created_at" })
  const { mutate: markRead, isPending: isMarkingRead } = useMarkNotificationRead("client")
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead("client")

  const unreadNotifications = data?.notifications?.filter((n) => !n.is_read) ?? []
  const hasUnread = unreadNotifications.length > 0

  const handleMarkAllRead = () => {
    markAllRead(unreadNotifications.map((n) => n.id))
  }

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ui-fg-base">Notifications</h1>
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingRead}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {isMarkingRead ? "Marking..." : "Mark All As Read"}
            </button>
          )}
        </div>

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
                <Link
                  href={notificationLink(n)}
                  className="text-ui-fg-interactive text-xs"
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  View details →
                </Link>
              )}
            </div>
            {!n.is_read && (
              <button
                onClick={() => markRead(n.id)}
                disabled={isMarkingRead}
                className="text-xs text-ui-fg-muted hover:text-ui-fg-base shrink-0 ml-4 disabled:opacity-50"
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
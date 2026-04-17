"use client"

import { useMemo, useState } from "react"
import {
  useDeveloperNotifications,
  useMarkNotificationRead,
  useDeleteNotifications,
  useDeleteAllNotifications,
} from "@lib/hooks/use-notifications"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const PAGE_SIZE = 15

export default function DeveloperNotifications() {
  const [pageIndex, setPageIndex] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const offset = useMemo(() => pageIndex * PAGE_SIZE, [pageIndex])

  const { data, isLoading } = useDeveloperNotifications({
    order: "-created_at",
    limit: PAGE_SIZE,
    offset,
  })

  const { mutate: markRead, isPending: isMarkingRead } = useMarkNotificationRead("developer")
  const { mutate: deleteNotifications, isPending: isDeleting } = useDeleteNotifications("developer")
  const { mutate: deleteAllNotifications, isPending: isDeletingAll } = useDeleteAllNotifications("developer")
  
  const notifications = data?.notifications ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const allOnPageSelected =
  notifications.length > 0 && notifications.every((n) => selected.has(n.id))
  const someOnPageSelected =
  notifications.some((n) => selected.has(n.id)) && !allOnPageSelected
  const allSelected = selected.size === totalCount

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        notifications.forEach((n) => next.delete(n.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        notifications.forEach((n) => next.add(n.id))
        return next
      })
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDelete = () => {
    if (selectAll) {
      // Pass a special flag to delete all for this recipient
      deleteAllNotifications(undefined, {
        onSuccess: () => { setSelected(new Set()); setSelectAll(false) },
      })
    } else {
      deleteNotifications(Array.from(selected), {
        onSuccess: () => setSelected(new Set()),
      })
    }
  }

  const notificationLink = (n: any) => {
    if (n.resource_type === "bug") return `/developer/account/my-bugs?bugId=${n.resource_id}`
    if (n.resource_type === "submission") return `/developer/account/my-submissions?submissionId=${n.resource_id}`
    return n.resource_url || "#"
  }

  return (
    <div className="py-12">
      <div className="content-container flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ui-fg-base">Notifications</h1>
          {(selected.size > 0 || selectAll) && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              {isDeleting
                ? "Deleting..."
                : selectAll
                ? `Delete all ${totalCount} notifications`
                : `Delete selected (${selected.size})`}
            </button>
          )}
        </div>

        {isLoading && <p className="text-ui-fg-muted text-sm">Loading...</p>}

        {!isLoading && notifications.length === 0 && (
          <p className="text-ui-fg-muted text-sm">You have no notifications.</p>
        )}

        {!isLoading && notifications.length > 0 && (
          <>
            {/* Select all row */}
            <div className="flex items-center gap-x-2 px-1 flex-wrap">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someOnPageSelected
                }}
                onChange={toggleSelectAll}
                className="cursor-pointer"
                aria-label="Select all on this page"
              />
              <span className="text-xs text-ui-fg-muted">
                {allSelected
                  ? `All ${totalCount} notifications selected`
                  : allOnPageSelected && totalCount > PAGE_SIZE
                  ? `${notifications.length} on this page selected — `
                  : selected.size > 0
                  ? `${selected.size} selected — `
                  : "Select all on this page"}
              </span>
              {allOnPageSelected && !allSelected && totalCount > PAGE_SIZE && (
                <button
                  onClick={() =>
                    // We can't fetch all IDs client-side without loading all pages,
                    // so we signal "select all" with a special flag instead
                    setSelectAll(true)
                  }
                  className="text-xs text-ui-fg-interactive hover:underline"
                >
                  Select all {totalCount} notifications
                </button>
              )}
              {allSelected && (
                <button
                  onClick={() => { setSelected(new Set()); setSelectAll(false) }}
                  className="text-xs text-ui-fg-interactive hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  n.is_read
                    ? "border-ui-border-base bg-ui-bg-base"
                    : "border-ui-border-base bg-ui-bg-subtle"
                }`}
              >
                <div className="flex items-start gap-x-3">
                  <input
                    type="checkbox"
                    checked={selected.has(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    className="mt-1 cursor-pointer"
                  />
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

            {/* Pagination — no selection reset on page change */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-ui-fg-muted">
                  Page {pageIndex + 1} of {totalPages} ({totalCount} total)
                </p>
                <div className="flex gap-x-2">
                  <button
                    onClick={() => setPageIndex((p) => p - 1)}
                    disabled={pageIndex === 0}
                    className="text-sm px-3 py-1 rounded border border-ui-border-base disabled:opacity-40 hover:bg-ui-bg-subtle"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPageIndex((p) => p + 1)}
                    disabled={pageIndex >= totalPages - 1}
                    className="text-sm px-3 py-1 rounded border border-ui-border-base disabled:opacity-40 hover:bg-ui-bg-subtle"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
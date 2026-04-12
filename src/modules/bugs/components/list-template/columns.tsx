"use client"

import { Bug } from "@lib/data/bugs"
import { StatusBadge, DifficultyBadge } from "@modules/common/components/bug-badges"
import { convertToLocale } from "@lib/util/money"
import { createDataTableColumnHelper } from "@medusajs/ui"
import UnreadMessageBadge from "@modules/messaging/components/unread-message-badge"

const columnHelper = createDataTableColumnHelper<Bug>()

export const convertDateToRelative = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
    return "Just now"
}

export const titleColumn = columnHelper.accessor("title", {
  header: "Title",
  enableSorting: true,
  sortLabel: "Title",
  sortAscLabel: "A-Z",
  sortDescLabel: "Z-A",
})

export const descriptionColumn = columnHelper.accessor("description", {
  header: "Description",
  enableSorting: false,
})

export const techStackColumn = columnHelper.accessor("tech_stack", {
  header: "Tech Stack",
  enableSorting: false,
})

export const createdAtColumn = columnHelper.accessor("created_at", {
  header: "Posted",
  enableSorting: true,
  sortLabel: "Posted",
  sortAscLabel: "Oldest first",
  sortDescLabel: "Newest first",
  cell: ({ getValue }) => {
    const date = getValue() as string
    return convertDateToRelative(date)
  }
})

export const bountyColumn = columnHelper.accessor("bounty", {
  header: "Bounty",
  enableSorting: true,
  sortLabel: "Bounty",
    cell: ({ getValue }) => {
      const bounty = getValue()

      if (bounty == null) {
          return <div className="flex h-full w-full items-center justify-end"><span className="text-ui-fg-muted">-</span></div>
        }
        return (
          <div className="flex h-full w-full items-center justify-end text-right">
            {convertToLocale({
              amount: bounty,
              locale: "en-US",
              currency_code: "usd",
            })}
          </div>
        )      
    }
})

export const developerStatusColumn = columnHelper.accessor("status", {
  header: "Status",
  enableSorting: true,
  sortLabel: "Status",
  sortAscLabel: "A-Z",
  sortDescLabel: "Z-A",
  cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
})

export const clientStatusColumn = columnHelper.accessor("status", {
  header: "Status",
  enableSorting: true,
  sortLabel: "Status",
  sortAscLabel: "A-Z",
  sortDescLabel: "Z-A",
  cell: ({ getValue }) => {
    const status = getValue() as string
    const shortLabel =
      status === "client approved" ? "Approved" :
      status === "client rejected" ? "Rejected" : undefined
    return <StatusBadge status={status} label={shortLabel} />
  },
})

export const difficultyColumn = columnHelper.accessor("difficulty", {
  header: "Difficulty",
  enableSorting: true,
  sortLabel: "Difficulty",
  sortAscLabel: "A-Z",
  sortDescLabel: "Z-A",
  cell: ({ getValue }) => <DifficultyBadge difficulty={getValue() as string} />,
})

export const createMessagesColumn = (
  currentUserId: string,
  currentUserType: "client" | "developer"
) =>
  columnHelper.display({
    id: "messages",
    header: "",
    cell: ({ row }) => {
      const bug = row.original
      const isActive =
        bug.status === "claimed" || bug.status === "fix submitted"

      if (!isActive) return null

      return (
        <UnreadMessageBadge
          bugId={bug.id}
        />
      )
    },
  })
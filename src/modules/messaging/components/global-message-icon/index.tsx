// src/modules/messaging/components/global-message-icon/index.tsx
"use client"

import { ChatBubbleLeftRight } from "@medusajs/icons"
import { useGlobalUnreadMessageCount } from "@lib/hooks/use-messages"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type GlobalMessageIconProps = {
  currentUserType: "client" | "developer"
}

export default function GlobalMessageIcon({
  currentUserType,
}: GlobalMessageIconProps) {
  const { unreadCount } = useGlobalUnreadMessageCount()

  return (
    <LocalizedClientLink
      href={`/${currentUserType}/account/messages`}
      className="relative flex items-center justify-center w-8 h-8"
      aria-label="Messages"
    >
      <ChatBubbleLeftRight className="text-ui-fg-subtle" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-semibold leading-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </LocalizedClientLink>
  )
}
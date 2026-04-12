// src/modules/messaging/components/message-thread/index.tsx
"use client"

import { useEffect, useRef } from "react"
import { useMessages, useSendMessage } from "@lib/hooks/use-messages"
import { useForm } from "react-hook-form"

type MessageThreadProps = {
  bugId: string
  currentUserId: string
}

type MessageForm = {
  content: string
}

export default function MessageThread({
  bugId,
  currentUserId
}: MessageThreadProps) {
  const { messages, isLoading } = useMessages(bugId)
  const { mutate: send, isPending: isSending } = useSendMessage(bugId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, reset, watch } = useForm<MessageForm>({
    defaultValues: { content: "" },
  })

  const content = watch("content")

  // SSE for real-time updates
  useEffect(() => {
   const source = new EventSource(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/bugs/${bugId}/messages/subscribe`
    )

    source.onmessage = () => {
      // Invalidation is handled by useSendMessage on the sender's side;
      // for the receiver, we rely on SSE to trigger a refetch
      // You can also call queryClient.invalidateQueries here if needed
    }

    return () => source.close()
  }, [bugId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onSubmit = ({ content }: MessageForm) => {
    send(
      { content },
      { onSuccess: () => reset() }
    )
  }

  if (isLoading) return <span className="text-sm text-ui-fg-subtle">Loading messages...</span>

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-sm text-ui-fg-subtle text-center">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-y-1 ${isCurrentUser ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-ui-fg-subtle capitalize">{msg.sender_type}</span>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  isCurrentUser
                    ? "bg-ui-button-inverted text-ui-fg-on-inverted"
                    : "bg-ui-bg-subtle text-ui-fg-base"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-ui-fg-muted">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-x-2 border-t p-4"
      >
        <input
          type="text"
          {...register("content")}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-ui-border-base px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !content.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
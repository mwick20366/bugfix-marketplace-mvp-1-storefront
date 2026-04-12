// src/lib/hooks/use-messages.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    listMessages,
    sendMessage,
    getUnreadCount,
    Message,
    getGlobalUnreadCount,
    markMessagesRead,
    listMessageThreads,
    MessageThreadsResponse
} from "@lib/data/messages"

export const useMessages = (bugId: string) => {
  const { data, isLoading, error } = useQuery<{ messages: Message[] } | null>({
    queryFn: () => listMessages({ bugId }),
    queryKey: ["messages", bugId],
    // enabled: !!bugId,
  })

  return {
    messages: data?.messages || [],
    isLoading,
    error,
  }
}

export const useMessageThreads = (
  unreadOnly = false
) => {
  const { data, isLoading } = useQuery<MessageThreadsResponse | null>({
    queryFn: () => listMessageThreads({ unreadOnly }),
    queryKey: ["message-threads", unreadOnly],
    enabled: true,  // always runs since auth is handled server-side
  })

  return {
    bugs: data?.bugs || [],
    isLoading,
  }
}

export const useSendMessage = (bugId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      content: string
    }) => sendMessage({ bugId, ...body }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["messages", bugId] })
        queryClient.invalidateQueries({ queryKey: ["messages-unread-global"] })
    },
  })
}

export const useUnreadMessageCount = (
  bugId: string
) => {
  const { data, isLoading } = useQuery<number>({
    queryFn: () => getUnreadCount({ bugId }),
    queryKey: ["messages-unread", bugId],

    enabled: !!bugId,
  })

  return { unreadCount: data ?? 0, isLoading }
}

export const useGlobalUnreadMessageCount = () => {
  const { data, isLoading } = useQuery<number>({
    queryFn: () => getGlobalUnreadCount(),

    queryKey: ["messages-unread-global"],
    refetchInterval: 30000, // poll every 30s as a fallback
  })

  return { unreadCount: data ?? 0, isLoading }
}

export const useMarkMessagesRead = (
  bugId: string,
  actorType: "client" | "developer"
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markMessagesRead({ bugId, actorType }),
    onSuccess: () => {
      // Invalidate per-bug message list
      queryClient.invalidateQueries({ queryKey: ["messages", bugId] })
      // Invalidate per-bug unread count
      queryClient.invalidateQueries({ queryKey: ["messages-unread", bugId] })
      // Invalidate global nav unread count
      queryClient.invalidateQueries({ queryKey: ["messages-unread-global"] })
    },
  })
}
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

type ThreadType = "bug" | "submission"

export const useMessages = (id: string, threadType: ThreadType = "bug") => {
  const { data, isLoading, error } = useQuery<{ messages: Message[] } | null>({
    queryFn: () => listMessages({ bugId: threadType === "bug" ? id : undefined, submissionId: threadType === "submission" ? id : undefined }),
    queryKey: ["messages", threadType, id],
  })

  return {
    messages: data?.messages || [],
    isLoading,
    error,
  }
}

export const useMessageThreads = (unreadOnly = false) => {
  const { data, isLoading } = useQuery<MessageThreadsResponse | null>({
    queryFn: () => listMessageThreads({ unreadOnly }),
    queryKey: ["message-threads", unreadOnly],
    enabled: true,
  })

  return {
    bugs: data?.bugs || [],
    submissions: data?.submissions || [],
    isLoading,
  }
}

export const useSendMessage = (id: string, threadType: ThreadType = "bug") => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { content: string }) =>
      sendMessage({
        bugId: threadType === "bug" ? id : undefined,
        submissionId: threadType === "submission" ? id : undefined,
        ...body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", threadType, id] })
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
    refetchInterval: 30000,
  })

  return { unreadCount: data ?? 0, isLoading }
}

export const useMarkMessagesRead = (
  id: string,
  actorType: "client" | "developer",
  threadType: ThreadType = "bug"
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markMessagesRead({
      bugId: threadType === "bug" ? id : undefined,
      submissionId: threadType === "submission" ? id : undefined,
      actorType,
    }),
    onSuccess: () => {
      console.log(`Marked messages as read for ${threadType} ${id} by ${actorType}`)
      queryClient.invalidateQueries({ queryKey: ["messages", threadType, id] })
      queryClient.invalidateQueries({ queryKey: ["messages-unread", id] })
      queryClient.invalidateQueries({ queryKey: ["messages-unread-global"] })
      queryClient.invalidateQueries({ queryKey: ["message-threads"] })
    },
  })
}
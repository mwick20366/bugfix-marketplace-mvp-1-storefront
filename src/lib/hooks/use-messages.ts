// src/lib/hooks/use-messages.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listMessages, sendMessage, Message } from "@lib/data/messages"

export const useMessages = (bugId: string) => {
  const { data, isLoading, error } = useQuery<{ messages: Message[] } | null>({
    queryFn: () => listMessages({ bugId }),
    queryKey: ["messages", bugId],
    enabled: !!bugId,
  })

  return {
    messages: data?.messages || [],
    isLoading,
    error,
  }
}

export const useSendMessage = (bugId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      content: string
      sender_type: "client" | "developer"
      sender_id: string
    }) => sendMessage({ bugId, ...body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", bugId] })
    },
  })
}
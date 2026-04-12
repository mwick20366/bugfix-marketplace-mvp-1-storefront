// src/lib/data/messages.ts
"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"
import { revalidateTag } from "next/dist/server/web/spec-extension/revalidate"

export type Message = {
  id: string
  bug_id: string
  sender_type: "client" | "developer"
  sender_id: string
  content: string
  created_at: string
}

export type MessagesResponse = {
  messages: Message[]
}

export type MessageThread = {
  id: string
  title: string
  status: string
  developer?: { first_name: string }
  client?: { first_name: string }
}

export type MessageThreadsResponse = {
  bugs: MessageThread[]
}

export const listMessages = async ({
  bugId,
  order = "-created_at",
}: {
  bugId: string
  order?: string
}): Promise<MessagesResponse | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = {
    ...authHeaders,
  }

  const next = {
    ...(await getCacheOptions(`messages-${bugId}`)),
  }

  const params = new URLSearchParams({ order })

  const result = await sdk.client.fetch(
    `/bugs/${bugId}/messages?${params.toString()}`,
    {
      headers,
      next,
      cache: "force-cache",
    }
  )

  return result as MessagesResponse
}

export const listMessageThreads = async ({
  unreadOnly = false,
}: {
  unreadOnly?: boolean
}): Promise<MessageThreadsResponse | null> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return null

  const params = new URLSearchParams({
    unread_only: String(unreadOnly),
  })

  const result = await sdk.client.fetch(
    `/messages?${params.toString()}`,
    {
      headers: { ...authHeaders },
      next: await getCacheOptions(`message-threads`),
      cache: "force-cache",
    }
  )

  return result as MessageThreadsResponse
}

export const sendMessage = async ({
  bugId,
  content,
}: {
  bugId: string
  content: string
}): Promise<{ success: boolean; message?: Message; error?: string }> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return { success: false, error: "Not authenticated" }

  const headers = {
    ...authHeaders,
  }

  return sdk.client
    .fetch(`/bugs/${bugId}/messages`, {
      method: "POST",
      headers,
      body: { content },
    })
    .then(async (result: any) => {
      const messagesCacheTag = await getCacheTag(`messages-${bugId}`)
      revalidateTag(messagesCacheTag)
      return { success: true, message: result.message }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const markMessagesRead = async ({
  bugId,
  actorType,
}: {
  bugId: string
  actorType: "client" | "developer"
}): Promise<{ success: boolean; error?: string }> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return { success: false, error: "Not authenticated" }

  return sdk.client
    .fetch(`/bugs/${bugId}/messages/mark-read`, {
      method: "POST",
      headers: { ...authHeaders },
      body: { reader_type: actorType },
    })
    .then(async () => {
      const messagesCacheTag = await getCacheTag(`messages-${bugId}`)
      revalidateTag(messagesCacheTag)
      // Also invalidate the global unread count
      const globalCacheTag = await getCacheTag(`messages-unread`)
      revalidateTag(globalCacheTag)
      return { success: true }
    })
    .catch((err) => ({ success: false, error: err.toString() }))
}

export const getUnreadCount = async ({
  bugId
}: {
  bugId: string
}): Promise<number> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return 0

  const result = await sdk.client.fetch(
    `/bugs/${bugId}/messages/unread`,
    {
      headers: { ...authHeaders },
      next: await getCacheOptions(`messages-${bugId}`),
      cache: "force-cache",
    }
  )

  return (result as any).unread_count ?? 0
}

export const getGlobalUnreadCount = async (): Promise<number> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return 0

  const result = await sdk.client.fetch(
    `/messages/unread`,
    { headers: { ...authHeaders }, next: await getCacheOptions(`messages-unread`), cache: "force-cache" }
  )

  return (result as any).unread_count ?? 0
}
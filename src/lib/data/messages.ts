// src/lib/data/messages.ts
"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"
import { revalidateTag } from "next/dist/server/web/spec-extension/revalidate"

export type Message = {
  id: string
  bug_id?: string
  submission_id?: string
  sender_type: "client" | "developer"
  sender_id: string
  sender_first_name: string
  sender_last_name: string
  sender_avatar_url?: string
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
  last_message_at?: string
  has_unread?: boolean
  developer?: { first_name: string, avatar_url?: string }
  client?: { first_name: string, avatar_url?: string }
}

export type SubmissionThread = {
  id: string
  notes: string
  status: string
  last_message_at?: string
  has_unread?: boolean
  developer?: { first_name: string, avatar_url?: string }
  bug?: { title: string; bounty?: number }
}

export type MessageThreadsResponse = {
  bugs: MessageThread[]
  submissions: SubmissionThread[]
}

export const listMessages = async ({
  bugId,
  submissionId,
  order = "-created_at",
}: {
  bugId?: string
  submissionId?: string
  order?: string
}): Promise<MessagesResponse | null> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return null

  const id = submissionId || bugId || ""
  const base = submissionId ? "submissions" : "bugs"
  const cacheKey = submissionId ? `messages-submission-${id}` : `messages-${id}`

  const params = new URLSearchParams({ order })

  const result = await sdk.client.fetch(
    `/${base}/${id}/messages?${params.toString()}`,
    {
      headers: { ...authHeaders },
      next: await getCacheOptions(cacheKey),
      cache: "no-store",
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
      cache: "no-store",
    }
  )

  return result as MessageThreadsResponse
}

export const sendMessage = async ({
  bugId,
  submissionId,
  content,
}: {
  bugId?: string
  submissionId?: string
  content: string
}): Promise<{ success: boolean; message?: Message; error?: string }> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return { success: false, error: "Not authenticated" }

  const id = submissionId || bugId || ""
  const base = submissionId ? "submissions" : "bugs"
  const cacheKey = submissionId ? `messages-submission-${id}` : `messages-${id}`

  return sdk.client
    .fetch(`/${base}/${id}/messages`, {
      method: "POST",
      headers: { ...authHeaders },
      body: { content },
    })
    .then(async (result: any) => {
      const messagesCacheTag = await getCacheTag(cacheKey)
      revalidateTag(messagesCacheTag)
      return { success: true, message: result.message }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const markMessagesRead = async ({
  bugId,
  submissionId,
  actorType,
}: {
  bugId?: string
  submissionId?: string
  actorType: "client" | "developer"
}): Promise<{ success: boolean; error?: string }> => {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) return { success: false, error: "Not authenticated" }

  const id = submissionId || bugId || ""
  const base = submissionId ? "submissions" : "bugs"
  const cacheKey = submissionId ? `messages-submission-${id}` : `messages-${id}`

  return sdk.client
    .fetch(`/${base}/${id}/messages/mark-read`, {
      method: "POST",
      headers: { ...authHeaders },
      body: { reader_type: actorType },
    })
    .then(async () => {
      const messagesCacheTag = await getCacheTag(cacheKey)
      revalidateTag(messagesCacheTag)
      const globalCacheTag = await getCacheTag(`messages-unread`)
      revalidateTag(globalCacheTag)
      return { success: true }
    })
    .catch((err) => ({ success: false, error: err.toString() }))
}

export const getUnreadCount = async ({
  bugId,
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
    {
      headers: { ...authHeaders },
      next: await getCacheOptions(`messages-unread`),
      cache: "force-cache",
    }
  )

  return (result as any).unread_count ?? 0
}
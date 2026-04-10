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

export const sendMessage = async ({
  bugId,
  content,
  sender_type,
  sender_id,
}: {
  bugId: string
  content: string
  sender_type: "client" | "developer"
  sender_id: string
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
      body: { content, sender_type, sender_id },
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
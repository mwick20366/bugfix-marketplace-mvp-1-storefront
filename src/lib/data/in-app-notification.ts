"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"
import { revalidateTag } from "next/dist/server/web/spec-extension/revalidate"

export type InAppNotification = {
  id: string
  message: string
  resource_id?: string
  resource_type?: string
  resource_url?: string
  is_read: boolean
  created_at: string
}

export type NotificationsResponse = {
  notifications: InAppNotification[]
  unread_count: number
}

export const retrieveNotifications = async ({
  actorType,
  order = "-created_at",
}: {
  actorType: "client" | "developer"
  order?: string
}): Promise<NotificationsResponse | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = {
    ...authHeaders,
  }

  const next = {
    ...(await getCacheOptions(`${actorType}-notifications`)),
  }

  const params = new URLSearchParams({ order })

  const result = await sdk.client.fetch(
    `/${actorType}s/me/notifications?${params.toString()}`,
    {
      headers,
      next,
      cache: "force-cache",
    }
  )

  return result as NotificationsResponse
}

export const markAsRead =
  async ({ id, actorType }: { id: string; actorType: "client" | "developer" }): Promise<{ success: boolean }> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return { success: false }

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions(`${actorType}s`)),
    }

    return sdk.client
      .fetch(`/${actorType}s/me/notifications/${id}`, {
        method: "POST",
        headers,
        next,
        cache: "force-cache",
      })
      .then(async () => {
        const notificationCacheTag = await getCacheTag(`${actorType}-notifications`)
        revalidateTag(notificationCacheTag)
        return { success: true, error: null }
      })
      .catch((err) => {
      return { success: false, error: err.toString() }
      })

    // return { success: result.success };
      // .then(({ client }) => client)
      // .catch(() => null)
  }
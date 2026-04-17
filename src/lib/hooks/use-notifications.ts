// src/lib/hooks/use-notifications.ts
"use client"

import { retrieveNotifications, markAsRead, NotificationsResponse } from "@lib/data/in-app-notification"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useClientNotifications({ order = "-created_at" } = {}) {
  return useQuery<NotificationsResponse | null>({
    queryKey: ["client-notifications", order],
    queryFn: () => retrieveNotifications({ actorType: "client", order }),
  })
}

export function useDeveloperNotifications({ order = "-created_at" } = {}) {
  return useQuery<NotificationsResponse | null>({
    queryKey: ["developer-notifications", order],
    queryFn: () => retrieveNotifications({ actorType: "developer", order }),
  })
}

export function useMarkNotificationRead(actorType: "client" | "developer") {
  const queryClient = useQueryClient()
  const queryKey = actorType === "client" ? ["client-notifications"] : ["developer-notifications"]

  return useMutation({
    mutationFn: (id: string) => markAsRead({ id, actorType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useMarkAllNotificationsRead(actorType: "client" | "developer") {
  const queryClient = useQueryClient()
  const queryKey = actorType === "client" ? ["client-notifications"] : ["developer-notifications"]

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => markAsRead({ id, actorType })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
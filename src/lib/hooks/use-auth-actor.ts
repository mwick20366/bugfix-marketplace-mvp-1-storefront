// src/hooks/use-auth-actor.ts
"use client"

import { sdk } from "@lib/config"
import { retrieveClient } from "@lib/data/client"
import { retrieveDeveloper } from "@lib/data/developer"
import { useState } from "react"
import { decodeToken } from "react-jwt"

type DecodedToken = {
  actor_id: string
  actor_type: string
  user_metadata: Record<string, unknown>
}

export const useAuthActor = () => {
  const [actorId, setActorId] = useState<string>("")
  const [actorType, setActorType] = useState<string>("")

  retrieveClient().then((client) => {
    if (client) {
      setActorId(client.id)
      setActorType("client")
    }
  })
  .catch(() => {
    retrieveDeveloper().then((developer) => {
      if (developer) {
        setActorId(developer.id)
        setActorType("developer")
      }})
      .catch(() => {
        console.log("No authenticated actor found")
      })
    // no-op
  })

  console.log("actorId", actorId)
  console.log("actorType", actorType)

  return {
    actorId,
    actorType,
    isDeveloper: actorId !== "" && actorType === "developer",
    isAuthenticated: actorId !== "",
  }
}
import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

export async function getActorType() {
  let actorType: "client" | "developer" | null = null

  try {
    const cookieStore = cookies()
    // Adjust the cookie/header name to match how your app stores the JWT
    const token = (await cookieStore).get("_medusa_jwt")?.value

    if (token) {
      const decoded = jwtDecode<{ actor_type: string} >(token)
      if (decoded.actor_type === "client" || decoded.actor_type === "developer") {
        actorType = decoded.actor_type
      }
    }
  } catch {
    // unauthenticated or invalid token
  }
  return actorType
}

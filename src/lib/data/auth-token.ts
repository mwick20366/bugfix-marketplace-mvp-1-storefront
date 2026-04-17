// src/lib/data/auth-token.ts
"use server"
import { getAuthHeaders } from "./cookies"

export const getAuthToken = async (): Promise<string | null> => {
  const headers = await getAuthHeaders() as Record<string, string>
  const authHeader = headers?.["Authorization"] || headers?.["authorization"]
  if (!authHeader) return null
  return authHeader.replace("Bearer ", "")
}

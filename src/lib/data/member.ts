import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { Developer } from "./developer"
import { Client } from "./client"

export type Member = {
  id: string
  email: string
  first_name: string
  last_name: string
}

export const retrieveMember =
  async (memberType: "client" | "developer"): Promise<Member | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    const response = await sdk.client
      .fetch< { developer: Developer; client: Client } >(`/${memberType}/me`, {
        method: "GET",
        // query: {
        //   fields: "*orders",
        // },
        headers,
        next,
        cache: "force-cache",
      });

      return response.developer || response.client || null;
  }

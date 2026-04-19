"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"
import { Member } from "./member"
import { Submission } from "./submissions"
import { Bug } from "./bugs"
import { NotificationsResponse } from "./in-app-notification"
import { getAuthToken } from "./auth-token"

// export type Client = Member & {
//   company: string
//   bugs?: Bug[],
// }

export type Client = {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  contact_first_name: string
  contact_last_name: string
  avatar_url?: string
  bugs?: Bug[]
  submissions?: Submission[]
}

export type ClientData = {
  client: Client
  dashboard: {
    open_bugs: number
    in_progress: number
    pending_approvals: number
    total_spent: number
  }
}

export const retrieveClient =
  async (): Promise<ClientData | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("clients")),
    }

    const result = await sdk.client
      .fetch(`/clients/me`, {
        headers,
        next,
        cache: "no-store",
      })

    return result as ClientData;
  }

export const updateClient = async (body: {
  contact_first_name?: string
  contact_last_name?: string
  company_name?: string
  avatar_url?: string
}) => {
  const token = await getAuthToken()

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/clients/me`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }
  )
  .finally(async () => {
    const clientCacheTag = getCacheTag("clients")
    revalidateTag(await clientCacheTag)
  })

  return response.json()
}

export async function signupClient(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const avatarUrl = formData.get("avatar_url") as string | null

  const clientForm = {
    email: formData.get("email") as string,
    contact_first_name: formData.get("contact_first_name") as string,
    contact_last_name: formData.get("contact_last_name") as string,
    company_name: formData.get("company_name") as string,
    ...(avatarUrl && { avatar_url: avatarUrl }),
  }

  console.log("Client form data:", clientForm)

  try {
    const token = await sdk.auth.register("client", "emailpass", {
      email: clientForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const createdClient = await sdk.client.fetch("/clients", {
      method: "POST",
      body: { ...clientForm },
      headers
    })

    const loginToken = await sdk.auth.login("client", "emailpass", {
      email: clientForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const clientCacheTag = await getCacheTag("clients")
    revalidateTag(clientCacheTag)

    return createdClient
  } catch (error: any) {
    return error.toString()
  }
}

export async function loginClient(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("client", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)

        const clientCacheTag = await getCacheTag("clients")
        revalidateTag(clientCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }
}

export async function signoutClient() {
  await sdk.auth.logout()

  await removeAuthToken()

  const clientCacheTag = await getCacheTag("clients")
  revalidateTag(clientCacheTag)

  redirect(`/client/account`)
}

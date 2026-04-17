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
        cache: "force-cache",
      })

    return result as ClientData;
      // .then(({ client }) => client)
      // .catch(() => null)
  }


// TODO: Change below to updateClient and allow updating client specific fields as well, not just customer fields
// export const updateClient = async (body: HttpTypes.StoreUpdateCustomer) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }
// export const updateMember = async (body: HttpTypes.StoreUpdateCustomer) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   const updateRes = await sdk.store.customer
//     .update(body, {}, headers)
//     .then(({ customer }) => customer)
//     .catch(medusaError)

//   const cacheTag = await getCacheTag("customers")
//   revalidateTag(cacheTag)

//   return updateRes
// }

export async function signupClient(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  
  const clientForm = {
    email: formData.get("email") as string,
    company_name: formData.get("company") as string,
    contact_first_name: formData.get("first_name") as string,
    contact_last_name: formData.get("last_name") as string,
  }

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
      body: {
        client: {
          ...clientForm,
        }
      },
      headers
    })

    const loginToken = await sdk.auth.login("client", "emailpass", {
      email: clientForm.email,
      password,
    })

    await setAuthToken(loginToken as string)
    sdk.client.setToken(loginToken as string)

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
        sdk.client.setToken(token as string)

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

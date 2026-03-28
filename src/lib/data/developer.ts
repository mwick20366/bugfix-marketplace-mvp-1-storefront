"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"
import { Member } from "./member"
import { Bug } from "./bugs"
import { Submission } from "./submissions"

export type Developer = Member & {
  // any developer specific fields
  bugs?: Bug[],
  submissions?: Submission[],
}

export const retrieveDeveloper =
  async (): Promise<Developer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("developers")),
    }

    return await sdk.client
      .fetch<{ developer: Developer }>(`/developers/me`, {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ developer }) => developer)
      .catch(() => null)
  }

export async function signupDeveloper(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  
  const developerForm = {
    email: formData.get("email") as string,
    firstName: formData.get("first_name") as string,
    lastName: formData.get("last_name") as string,
  }

  try {
    const token = await sdk.auth.register("developer", "emailpass", {
      email: developerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const createdDeveloper = await sdk.client.fetch("/developer", {
      method: "POST",
      body: developerForm,
      headers
    })

    const loginToken = await sdk.auth.login("developer", "emailpass", {
      email: developerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const developerCacheTag = await getCacheTag("developers")
    revalidateTag(developerCacheTag)

    return createdDeveloper
  } catch (error: any) {
    return error.toString()
  }
}

export async function loginDeveloper(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("developer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const developerCacheTag = await getCacheTag("developers")
        revalidateTag(developerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }
}

export async function signoutDeveloper(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const developerCacheTag = await getCacheTag("developers")
  revalidateTag(developerCacheTag)

  // await removeCartId()

  // const cartCacheTag = await getCacheTag("carts")
  // revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/developer/account`)
}

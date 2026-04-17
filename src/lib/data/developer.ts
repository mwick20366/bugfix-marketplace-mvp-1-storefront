"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  removeAuthToken,
  setAuthToken,
} from "./cookies"
import { Bug } from "./bugs"
import { Submission } from "./submissions"

export type Developer = {
  id: string
  email: string
  first_name: string
  last_name: string
  bugs?: Bug[]
  submissions?: Submission[]
}

export type DeveloperData = {
  developer: Developer
  dashboard: {
    open_bugs: number
    active_claims: number
    pending_review: number
    total_earned: number
  }
}

export type DeveloperReview = {
  id: string
  rating: number
  notes: string
  client: {
    id: string
    contact_first_name: string
    company_name: string
  }
  submission: {
    id: string
    bug: {
      id: string
    }
  }

  created_at: string
}

export type DeveloperReviewResponse = {
  reviews: DeveloperReview[]
}

export const retrieveDeveloper =
  async (): Promise<DeveloperData | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("developers")),
    }

    const result = await sdk.client
      .fetch(`/developers/me`, {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      })

      return result as DeveloperData
  }

export const retrieveDeveloperReviews =
  async (): Promise<DeveloperReviewResponse | null> => {
    console.log("Retrieving developer reviews...")

    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("developer-reviews")),
    }

    const result = await sdk.client
      .fetch(`/developers/me/reviews`, {
        method: "GET",
        headers,
        next,
        cache: "no-store",
      })

    return result as DeveloperReviewResponse
  }

export async function signupDeveloper(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  
  const developerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
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

    const createdDeveloper = await sdk.client.fetch("/developers", {
      method: "POST",
      body: { ...developerForm },
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

export async function signoutDeveloper() {
  await sdk.auth.logout()

  await removeAuthToken()

  const developerCacheTag = await getCacheTag("developers")
  revalidateTag(developerCacheTag)

  // await removeCartId()

  // const cartCacheTag = await getCacheTag("carts")
  // revalidateTag(cartCacheTag)

  redirect(`/developer/account`)
}

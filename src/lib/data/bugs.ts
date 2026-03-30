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
import { Developer } from "./developer"
import { cli } from "webpack"
import { SortOptions } from "@modules/marketplace/components/refinement-list/sort-bugs"
import { sortBugs } from "@lib/util/sort-bugs"
import { Client } from "./client"

export type Bug = {
    original: Bug
    id: string,
    title: string,
    description: string,
    techStack: string,
    repoLink: string,
    bounty: number,
    status: string,
    created_at: string,
    updated_at: string,
    developer?: Developer
    client?: Client
}

export const retrieveBug =
  async (id: string): Promise<Bug | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null;

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("bug")),
    }

    return await sdk.client
      .fetch<{ bug: Bug }>(`/bugs/${id}`, {
        method: "GET",
        // query: {
        //   fields: "*orders",
        // },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ bug }) => bug)
      .catch(() => null)    
  }

export const listBugs = async ({
  queryParams,
}: {
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
  sortBy?: SortOptions
}): Promise<{
  response: { bugs: Bug[]; count: number }
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
}> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("bugs")),
  }

  return sdk.client
    .fetch<{ bugs: Bug[]; count: number }>(
      `/bugs`,
      {
        method: "GET",
        query: {
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ bugs, count }) => {
      console.log("Fetched bugs:", bugs)
      return {
        response: {
          bugs,
          count,
        },
        queryParams,
      }
    })
}

export const listDeveloperBugs = async ({
  queryParams,
}: {
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
  sortBy?: SortOptions
}): Promise<{
  response: { bugs: Bug[]; count: number }
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
}> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("bugs")),
  }

  return sdk.client
    .fetch<{ bugs: Bug[]; count: number }>(
      `/bugs`,
      {
        method: "GET",
        query: {
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ bugs, count }) => {
      return {
        response: {
          bugs,
          count,
        },
        queryParams,
      }
    })
}

export const retrieveClientBugs =
  async (clientId: string): Promise<Bug[]> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return []

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("bugs")),
    }

    return await sdk.client
      .fetch<{ bugs: Bug[] }>(`/bugs/clients/${clientId}`, {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ bugs }) => bugs)
      .catch(() => [])
  }

export const retrieveDeveloperBugs =
  async (developerId: string): Promise<Bug[] | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ bugs: Bug[] }>(`/bugs/developer/${developerId}`, {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ bugs }) => bugs)
      .catch(() => null)
  }

export const createBug = async ({
  title,
  description,
  techStack,
  repoLink,
  bounty,
  clientId,
}: {
  title: string
  description: string
  techStack: string
  repoLink: string
  bounty: number
  clientId: string
}): Promise<any> => {

  console.log('Adding bug with form data:', { title, description, techStack, repoLink, bounty, clientId })

  const bug = {
    title,
    description,
    techStack,
    repoLink,
    bounty,
    client_id: clientId,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch(`/bugs`, {
    method: "POST",
    body: bug,
    headers,
    })
    .then(async () => {
      const cacheTag = await getCacheTag("bugs")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateBug = async ({
  title,
  description,
  techStack,
  repoLink,
  bounty,
  clientId,
  bugId,
}: {
  title: string
  description: string
  techStack: string
  repoLink: string
  bounty: number
  clientId: string
  bugId: string
}): Promise<any> => {

  const bug = {
    title,
    description,
    techStack,
    repoLink,
    bounty,
    client_id: clientId,
    id: bugId,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch(`/bugs/${bugId}`, {
    method: "POST",
    body: bug,
    headers,
    })
    .then(async () => {
      const cacheTag = await getCacheTag("bugs")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const claimBug = async (
  bugId: string,
  // developerId: string,
): Promise<any> => {
  // const bugId = formData.get("bugId") as string
  // const developerId = formData.get("developerId") as string
  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch(`/bugs/${bugId}/claim`, {
    method: "POST",
    // body: { developer_id: developerId },
    headers,
  })
    .then(async () => {
      const bugsCacheTag = await getCacheTag("bugs")
      revalidateTag(bugsCacheTag)

      const developerCacheTag = await getCacheTag("developers")
      revalidateTag(developerCacheTag)

      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const unclaimBug = async (
  bugId: string,
  // developerId: string,
): Promise<any> => {
  // const bugId = formData.get("bugId") as string
  // const developerId = formData.get("developerId") as string
  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch(`/bugs/${bugId}/unclaim`, {
    method: "POST",
    // body: { developer_id: developerId },
    headers,
  })
    .then(async () => {
      const bugsCacheTag = await getCacheTag("bugs")
      revalidateTag(bugsCacheTag)

      const developerCacheTag = await getCacheTag("developers")
      revalidateTag(developerCacheTag)

      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const submitFix = async (
  notes: string,
  fileUrl: string,
  bugId: string,
): Promise<any> => {
  // const bugId = formData.get("bugId") as string

  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch(`/bugs/${bugId}/submit-fix`, {
    method: "POST",
    body: {
      submission: {
        notes,
        fileUrl,
      },
    },
    headers,
  })
    .then(async () => {
      const bugCacheTag = await getCacheTag("bugs")
      revalidateTag(bugCacheTag)

      const submissionCacheTag = await getCacheTag("submissions")
      revalidateTag(submissionCacheTag)
      
      const developerCacheTag = await getCacheTag("developers")
      revalidateTag(developerCacheTag)

      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
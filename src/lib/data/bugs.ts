"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
} from "./cookies"
import { Developer } from "./developer"
import { SortOptions } from "@modules/marketplace/components/refinement-list/sort-bugs"
import { Client } from "./client"
import { Submission } from "./submissions"

export type Bug = {
    original: Bug
    id: string,
    title: string,
    description: string,
    tech_stack: string,
    repo_link: string,
    bounty: number,
    status: string,
    difficulty: "easy" | "medium" | "hard",
    created_at: string,
    updated_at: string,
    claimed_at?: string,
    developer?: Developer
    client?: Client
    submissions?: Submission[]
    attachments?: {
      id: string
      url: string
      filename: string
    }[]
}

type BugData = {
  bug: Bug
}

export const retrieveBug = async (id: string): Promise<Bug | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("bugs")),
  }

  return await sdk.client
    .fetch<BugData>(`/bugs/${id}`, {
      method: "GET",
      headers,
      next,
      cache: "no-store",
      query: {
        fields: "id,title,description,tech_stack,repo_link,bounty,difficulty,status,claimed_at,created_at,updated_at,*attachments,*developer,*client,*submissions",
      },
    })
    .then(({ bug }) => bug)
    .catch(() => null)
}

export const listBugs = async ({
  queryParams,
}: {
  queryParams?: HttpTypes.FindParams & {
    developer_id?: string,
    client_id?: string,
    q?: string
    status?: string | string[]
    difficulty?: string | string[]
    tech_stack?: string[]  // ← add this
  }
  sortBy?: SortOptions
}): Promise<{
  response: { bugs: Bug[]; count: number }
  queryParams?: HttpTypes.FindParams & {
    developer_id?: string,
    client_id?: string,
    q?: string
    status?: string | string[]
    difficulty?: string | string[]
    tech_stack?: string[]  // ← add this
  }
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
        cache: "no-store",
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

export const listMarketplaceBugs = async ({
  queryParams,
}: {
  queryParams?: HttpTypes.FindParams & {
    q?: string
    difficulty?: string | string[]
  }
  sortBy?: SortOptions
}): Promise<{
  response: { bugs: Bug[]; count: number }
  queryParams?: HttpTypes.FindParams & {
    q?: string
    difficulty?: string | string[]
  }
}> => {
  const next = {
    ...(await getCacheOptions("marketplace-bugs")),
  }

  return sdk.client
    .fetch<{ bugs: Bug[]; count: number }>(
      `/marketplace/bugs`,
      {
        method: "GET",
        query: {
          ...queryParams,
        },
        next,
        cache: "no-store",
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
        cache: "no-store",
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
  tech_stack,
  repo_link,
  bounty,
  clientId,
  difficulty,
  attachments,
}: {
  title: string
  description: string
  tech_stack: string
  repo_link: string
  bounty: number
  clientId: string
  difficulty: "easy" | "medium" | "hard"
  attachments?: {
    file_id: string
    file_url: string
    filename: string
  }[]
}): Promise<any> => {
  const bug = {
    title,
    description,
    tech_stack,
    repo_link,
    bounty,
    client_id: clientId,
    difficulty,
    attachments,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const result = await sdk.client.fetch(`/bugs`, {
    method: "POST",
    body: bug,
    headers,
  })

  const cacheTag = await getCacheTag("bugs")
  revalidateTag(cacheTag)

  return result
}

export const updateBug = async ({
  title,
  description,
  tech_stack,
  repo_link,
  bounty,
  difficulty,
  bugId,
  attachments,
}: {
  title: string
  description: string
  tech_stack: string
  repo_link: string
  bounty: number
  difficulty: "easy" | "medium" | "hard"
  bugId: string
  attachments?: {
    file_id: string
    file_url: string
    filename: string
  }[]
}): Promise<any> => {
  const bug = {
    title,
    description,
    tech_stack,
    repo_link,
    bounty,
    id: bugId,
    difficulty,
    attachments,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const result = await sdk.client.fetch(`/bugs/${bugId}`, {
    method: "POST",
    body: bug,
    headers,
  })

  const cacheTag = await getCacheTag("bugs")
  revalidateTag(cacheTag)

  return result
}

export const claimBug = async (
  bugId: string,
): Promise<any> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const result = await sdk.client.fetch(`/bugs/${bugId}/claim`, {
    method: "POST",
    headers,
  })

  const bugsCacheTag = await getCacheTag("bugs")
  revalidateTag(bugsCacheTag)

  const developerCacheTag = await getCacheTag("developers")
  revalidateTag(developerCacheTag)

  return result
}

export const unclaimBug = async (
  bugId: string,
): Promise<any> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const result = await sdk.client.fetch(`/bugs/${bugId}/unclaim`, {
    method: "POST",
    headers,
  })

  const bugsCacheTag = await getCacheTag("bugs")
  revalidateTag(bugsCacheTag)

  const developerCacheTag = await getCacheTag("developers")
  revalidateTag(developerCacheTag)

  return result
}

export const submitFix = async (
  notes: string,
  file_url: string,
  bugId: string,
): Promise<any> => {
  // const bugId = formData.get("bugId") as string

  const headers = {
    ...(await getAuthHeaders()),
  }

  const result = await sdk.client.fetch(`/bugs/${bugId}/submit-fix`, {
    method: "POST",
    body: {
      submission: {
        notes,
        file_url,
      },
    },
    headers,
  })

  const bugCacheTag = await getCacheTag("bugs")
  revalidateTag(bugCacheTag)

  const submissionCacheTag = await getCacheTag("submissions")
  revalidateTag(submissionCacheTag)
  
  const developerCacheTag = await getCacheTag("developers")
  revalidateTag(developerCacheTag)

  return result
}
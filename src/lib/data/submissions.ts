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
import { Bug } from "./bugs"

export type Submission = {
    original: Submission
    id: string,
    notes: string,
    fileUrl: string,
    bug?: Bug,
    status: string,
    created_at: string,
    updated_at: string,
    clientNotes?: string,
}

export const retrieveSubmission =
  async (id: string): Promise<Submission | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null;

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("submission")),
    }

    return await sdk.client
      .fetch<{ submission: Submission }>(`/submissions/${id}`, {
        method: "GET",
        // query: {
        //   fields: "*orders",
        // },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ submission }) => submission)
      .catch(() => null)    
  }

export const listSubmissions = async ({
  queryParams,
}: {
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
  sortBy?: SortOptions
}): Promise<{
  response: { submissions: Submission[]; count: number }
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
}> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("submissions")),
  }

  return sdk.client
    .fetch<{ submissions: Submission[]; count: number }>(
      `/submissions`,
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
    .then(({ submissions, count }) => {
      console.log("Fetched submissions:", submissions)
      console.log("Fetched submissions count:", count)
      
      return {
        response: {
          submissions,
          count,
        },
        queryParams,
      }
    })
}

export const listDeveloperSubmissions = async ({
  queryParams,
}: {
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
  sortBy?: SortOptions
}): Promise<{
  response: { submissions: Submission[]; count: number }
  queryParams?: HttpTypes.FindParams & { q?: string, status?: string }
}> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("submissions")),
  }

  return sdk.client
    .fetch<{ submissions: Submission[]; count: number }>(
      `/submissions`,
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
    .then(({ submissions, count }) => {
      return {
        response: {
          submissions,
          count,
        },
        queryParams,
      }
    })
}

export const createSubmission = async (
  notes: string,
  fileUrl: string,
  bugId: string,
): Promise<{ success: boolean; error: string | null }> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("submissions")),
  }

  return sdk.client.fetch(`/submissions`, {
    method: "POST",
    body: JSON.stringify({
      notes,
      file_url: fileUrl,
      bug_id: bugId,
    }),
    headers,
    next,
    cache: "force-cache",
  })
    .then(async () => {
      const cacheTag = await getCacheTag("submissions")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const approveSubmission = async (
  submissionId: string,
  // developerId: string,
): Promise<any> => {
  // const submissionId = formData.get("submissionId") as string
  // const developerId = formData.get("developerId") as string
  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client.fetch(`/submissions/${submissionId}/approve`, {
    method: "POST",
    // body: { developer_id: developerId },
    headers,
  })
    .then(async () => {
      const cacheTag = await getCacheTag("submissions")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
} from "./cookies"
import { SortOptions } from "@modules/marketplace/components/refinement-list/sort-bugs"
import { Bug } from "./bugs"

export type Submission = {
  original: Submission
  id: string,
  notes: string,
  file_url: string,
  bug?: Bug,
  status: string,
  created_at: string,
  updated_at: string,
  client_notes?: string,
  developer?: { id: string, first_name: string },
  client?: { id: string, first_name: string },
  attachments?: {
    id: string
    url: string
    filename: string
  }[]
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
    ...(await getCacheOptions("my-submissions")),
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
    ...(await getCacheOptions("developer-submissions")),
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
  file_url: string,
  bugId: string,
): Promise<any> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("my-submissions")),
  }

  const result = await sdk.client.fetch(`/submissions`, {
    method: "POST",
    body: JSON.stringify({
      notes,
      file_url: file_url,
      bug_id: bugId,
    }),
    headers,
    next,
    cache: "force-cache",
  })

  const cacheTag = await getCacheTag("my-submissions")
  revalidateTag(cacheTag)

  return result
}

export const initiateSubmissionApproval = async (
  submissionId: string,
): Promise<any> => {
  const headers = { ...(await getAuthHeaders()) }

  // Let the SDK's FetchError propagate naturally
  const result = await sdk.client.fetch<{
    submission: Submission,
    clientSecret: string
    paymentSession: any
  }>(`/submissions/${submissionId}/initiate-approval`, {
    method: "POST",
    headers,
  })

  return result
}

export const finalizeSubmissionApproval = async (
  submissionId: string,
  client_notes?: string,
  payment_collection_id?: string
): Promise<any> => {
  const headers = { ...(await getAuthHeaders()) }

  // Let the SDK's FetchError propagate naturally
  const result = await sdk.client.fetch<{
    submission: Submission,
    payment_collection_id: string
  }>(`/submissions/${submissionId}/finalize-approval`, {
    method: "POST",
    body: {
      client_notes,
      payment_collection_id,
    },
    headers,
  })

  const developerCacheTag = await getCacheTag("developer-submissions")
  revalidateTag(developerCacheTag)

  const cacheTag = await getCacheTag("my-submissions")
  revalidateTag(cacheTag)

  return result
}

// export const captureSubmission = async (
//   submissionId: string,
//   paymentId: string,
//   client_notes?: string,
// ): Promise<any> => {
//   const headers = { ...(await getAuthHeaders()) }

//   const submission = {
//     payment_id: paymentId,
//     client_notes,
//   }

//   // Let the SDK's FetchError propagate naturally
//   const result = await sdk.client.fetch<{
//     submission: Submission,
//   }>(`/submissions/${submissionId}/capture`, {
//     method: "POST",
//     body: {
//       payment_id: paymentId,
//       client_notes,
//     },
//     headers,
//   })

export const rejectSubmission = async (
  submissionId: string,
  client_notes?: string,
): Promise<any> => {
  const headers = { ...(await getAuthHeaders()) }

  // Let the SDK's FetchError propagate naturally
  const submission = {
    client_notes,
  }

  const result = await sdk.client.fetch(`/submissions/${submissionId}/reject`, {
    method: "POST",
    body: submission,
    headers,
  })

  const developerCacheTag = await getCacheTag("developer-submissions")
  revalidateTag(developerCacheTag)

  const cacheTag = await getCacheTag("my-submissions")
  revalidateTag(cacheTag)

  return result
}
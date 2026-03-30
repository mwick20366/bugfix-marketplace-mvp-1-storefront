import { z } from "zod"

export const createBugSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  techStack: z.string().min(1, "Tech stack is required"),
  repoLink: z.string().url("Repo link must be a valid URL"),
  bounty: z.number().min(1),
})

export type CreateBugSchema = z.infer<typeof createBugSchema>

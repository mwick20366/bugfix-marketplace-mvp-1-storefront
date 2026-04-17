import { z } from "zod"

export const submitFixSchema = z.object({
  notes: z.string().min(1, "Notes are required"),
  file_url: z.string().url().optional().or(z.literal("")),
})

export type SubmitFixSchema = z.infer<typeof submitFixSchema>
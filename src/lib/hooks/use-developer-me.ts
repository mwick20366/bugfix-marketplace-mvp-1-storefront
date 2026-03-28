"use client"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "@lib/config"
import { Developer, retrieveDeveloper } from "@lib/data/developer"

export const useDeveloperMe = () => {
  const result = useQuery({
    queryFn: () => retrieveDeveloper().catch(() => null),
    queryKey: ["developer-me"],
    staleTime: 0,
  })

  return {
    ...result,
    developer: (result.data ?? null) as Developer | null,
  }

}
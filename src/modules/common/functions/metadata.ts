// @lib/metadata.ts
import React from "react"
import TitleSync from "@modules/common/components/title-sync"

export async function getPageMetadata(
  title: string,
  searchParams?: Promise<any>
) {
  if (searchParams) {
    await searchParams
  }

  return {
    metadata: { title },
    Sync: React.createElement(TitleSync, { title }),
  }
}

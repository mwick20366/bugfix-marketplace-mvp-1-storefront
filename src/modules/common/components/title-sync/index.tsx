// @modules/common/components/title-sync.tsx
"use client"
import { useEffect } from "react"

export default function TitleSync({ title }: { title: string }) {
  useEffect(() => {
    // Manually force the browser tab to update
    document.title = `${title} | Bugzapper`
  }, [title])

  return null // This component renders nothing
}

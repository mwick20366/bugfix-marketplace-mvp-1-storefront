// src/app/(main)/marketplace/page.tsx
import BrowseBugsView from "@modules/marketplace/components/browse-bugs-view"

export default function BrowseBugsPage() {
  return (
    <div className="py-12">
      <div className="content-container">
        <h1 className="text-2xl font-semibold mb-6">Browse Open Bugs</h1>
        <BrowseBugsView />
      </div>
    </div>
  )
}
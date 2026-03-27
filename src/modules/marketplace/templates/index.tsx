import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/marketplace/components/refinement-list"
import { SortOptions } from "@modules/marketplace/components/refinement-list/sort-bugs"

import PaginatedBugs from "../components/open-bugs"

const MarketplaceTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All bugs</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          {/* <PaginatedBugs
            sortBy={sort}
            page={pageNumber}
          /> */}
        </Suspense>
      </div>
    </div>
  )
}

export default MarketplaceTemplate

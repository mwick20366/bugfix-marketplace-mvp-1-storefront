
// import OpenBugs from "@modules/bugs/components/open-bugs"
// import Hero from "@modules/home/components/hero"
import { SortOptions } from "@modules/marketplace/components/refinement-list/sort-bugs"
import PaginatedBugs from "@modules/marketplace/components/open-bugs"

// export const metadata: Metadata = {
//   title: "Medusa Next.js Starter Template",
//   description:
//     "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
// }

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
  }>
}

export default async function MarketplaceBugs(props: Params) {
  const searchParams = await props.searchParams
  const { page, sortBy, q } = searchParams
  console.log("MarketplaceBugs page param:", page)
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  // const { collections } = await listCollections({
  //   fields: "id, handle, title",
  // })

  // if (!collections || !region) {
  //   return null
  // }

  return (
    <>
      {/* <Hero /> */}
      <div className="py-12">
        <div className="content-container" data-testid="cart-container">
          {/* <PaginatedBugs sortBy={sort} status="open" page={pageNumber} q={q} /> */}
        </div>
      </div>
    </>
  )
}

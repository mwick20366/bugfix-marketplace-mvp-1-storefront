import { Bug } from "@lib/data/bugs"
import { retrieveDeveloper } from "@lib/data/developer"
import OpenBugs from "@modules/marketplace/components/open-bugs"
import { redirect } from "next/navigation"

const BUG_LIMIT = 15

type Params = {
  searchParams: Promise<{
    limit?: number
    offset?: number
    sortId?: string
    sortDesc?: boolean
    q?: string
  }>
}

export default async function Page(props: Params) {
  const developer = await retrieveDeveloper().catch(() => null)

  console.log('developer', developer);

  if (!developer) {
    redirect(`/login?redirectTo=${encodeURIComponent(window.location.href)}`)
  }

  // const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  // const [isModalOpen, setIsModalOpen] = useStat<boolean>(false)

  const searchParams = await props.searchParams
  const { limit, offset, sortId, sortDesc, q } = searchParams

  const openBugsParams = {
    limit: limit || BUG_LIMIT,
    offset: offset || 0,
    q: q || "",
    sortId: sortId || "created_at",
    sortDesc: sortDesc || true,
  }

  // const bugsListSortingParams = {
  //   sortId: sortId || "created_at",
  //   sortDesc: sortDesc || true,
  // }

  // const handleRowClicked = (bug: Bug) => {
  //   setSelectedBug(bug)
  //   setIsModalOpen(true)
  // }

  // const handleCloseModal = () => {
  //   setIsModalOpen(false)
  //   setSelectedBug(null)
  // }

  // const handleClaimBug = async (bugId: string) => {
  //   // Implement bug claiming logic here
  //   setIsModalOpen(false)
  //   setSelectedBug(null)
  // }

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {/* <div className="w-full">
          <div className="flex w-full items-center justify-between">
            <h1 className={`text-2xl`}>Bugs</h1>
          </div> */}
          <OpenBugs
            {...openBugsParams}
            // developer={developer}
            // queryParams={bugsListQueryParams}
            // sortingParams={bugsListSortingParams}
            // onRowClick={handleRowClicked}
          />
          {/* <ClaimBugModal
            open={isModalOpen}
            onOpenChange={handleCloseModal}
            onSubmit={handleClaimBug}
            bug={selectedBug}
          /> */}
        {/* </div> */}
      </div>
    </div>
  )
}

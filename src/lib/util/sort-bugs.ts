import { Bug } from "@lib/data/bugs"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/marketplace/components/refinement-list/sort-bugs"

// interface MinBountyBug extends Bug {
//   _minBounty?: number
// }

export function sortBugs(
  bugs: Bug[],
  sortBy: SortOptions
): Bug[] {
  let sortedBugs = bugs

  if (["bounty_asc", "bounty_desc"].includes(sortBy)) {
    // Sort bugs based on the precomputed minimum bounties
    sortedBugs.sort((a, b) => {
      const diff = a.bounty! - b.bounty!
      return sortBy === "bounty_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedBugs.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  return sortedBugs
}

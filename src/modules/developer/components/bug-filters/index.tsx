// src/modules/developer/components/bug-filters/index.tsx
"use client"

import StatusFilter from "@modules/bugs/components/status-filter"
import DifficultyFilter from "@modules/bugs/components/difficulty-filter"

type BugFiltersProps = {
  selectedStatuses: string[]
  selectedDifficulties: string[]
  onStatusChange: (values: string[]) => void
  onDifficultyChange: (values: string[]) => void
}

export default function BugFilters({
  selectedStatuses,
  selectedDifficulties,
  onStatusChange,
  onDifficultyChange,
}: BugFiltersProps) {
  return (
    <div className="flex flex-col gap-y-6 pt-4">
      <StatusFilter selectedStatuses={selectedStatuses} onStatusChange={onStatusChange} />
      <div className="border-t border-ui-border-base" />
      <DifficultyFilter selectedDifficulties={selectedDifficulties} onDifficultyChange={onDifficultyChange} />
    </div>
  )
}
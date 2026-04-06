// src/modules/developer/components/bug-filters/index.tsx
"use client"

import { Checkbox, Label, clx } from "@medusajs/ui"

type FilterOption = {
  value: string
  label: string
}

type CheckboxGroupProps = {
  title: string
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
}

const CheckboxGroup = ({ title, options, selected, onChange }: CheckboxGroupProps) => {
  const allSelected = selected.length === 0 || selected.includes("all")

  const handleAll = () => {
    onChange([])
  }

  const handleOption = (value: string) => {
    if (selected.includes(value)) {
      const next = selected.filter((v) => v !== value)
      onChange(next)
    } else {
      const next = [...selected.filter((v) => v !== "all"), value]
      onChange(next)
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-ui-fg-base text-sm font-medium">{title}</p>

      {/* All option */}
      <div className="flex items-center gap-x-2">
        <Checkbox
          id={`${title}-all`}
          checked={allSelected}
          onCheckedChange={handleAll}
        />
        <Label htmlFor={`${title}-all`} className="text-sm font-normal cursor-pointer">
          All
        </Label>
      </div>

      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-x-2">
          <Checkbox
            id={`${title}-${option.value}`}
            checked={!allSelected && selected.includes(option.value)}
            onCheckedChange={() => handleOption(option.value)}
          />
          <Label
            htmlFor={`${title}-${option.value}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  )
}

type BugFiltersProps = {
  selectedStatuses: string[]
  selectedDifficulties: string[]
  onStatusChange: (values: string[]) => void
  onDifficultyChange: (values: string[]) => void
}

const statusOptions: FilterOption[] = [
  { value: "open", label: "Open" },
  { value: "claimed", label: "Developer Claimed" },
  { value: "fix submitted", label: "Developer Fix Submitted" },
  { value: "client approved", label: "Approved" },
  { value: "client rejected", label: "Rejected" },
]

const difficultyOptions: FilterOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export default function BugFilters({
  selectedStatuses,
  selectedDifficulties,
  onStatusChange,
  onDifficultyChange,
}: BugFiltersProps) {
  return (
    <div className="flex flex-col gap-y-6 pt-4">
      <CheckboxGroup
        title="Status"
        options={statusOptions}
        selected={selectedStatuses}
        onChange={onStatusChange}
      />
      <div className="border-t border-ui-border-base" />
      <CheckboxGroup
        title="Difficulty"
        options={difficultyOptions}
        selected={selectedDifficulties}
        onChange={onDifficultyChange}
      />
    </div>
  )
}
// src/modules/bugs/components/difficulty-filter/index.tsx
"use client"

import { Checkbox, Label } from "@medusajs/ui"

type FilterOption = {
  value: string
  label: string
}

const difficultyOptions: FilterOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

type DifficultyFilterProps = {
  selectedDifficulties: string[]
  onDifficultyChange: (values: string[]) => void
}

export default function DifficultyFilter({
  selectedDifficulties,
  onDifficultyChange,
}: DifficultyFilterProps) {
  const allSelected = selectedDifficulties.length === 0 || selectedDifficulties.includes("all")

  const handleAll = () => onDifficultyChange([])

  const handleOption = (value: string) => {
    if (selectedDifficulties.includes(value)) {
      onDifficultyChange(selectedDifficulties.filter((v) => v !== value))
    } else {
      onDifficultyChange([...selectedDifficulties.filter((v) => v !== "all"), value])
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-ui-fg-base text-sm font-medium">Difficulty</p>
      <div className="flex items-center gap-x-2">
        <Checkbox id="difficulty-all" checked={allSelected} onCheckedChange={handleAll} />
        <Label htmlFor="difficulty-all" className="text-sm font-normal cursor-pointer">All</Label>
      </div>
      {difficultyOptions.map((option) => (
        <div key={option.value} className="flex items-center gap-x-2">
          <Checkbox
            id={`difficulty-${option.value}`}
            checked={!allSelected && selectedDifficulties.includes(option.value)}
            onCheckedChange={() => handleOption(option.value)}
          />
          <Label htmlFor={`difficulty-${option.value}`} className="text-sm font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  )
}
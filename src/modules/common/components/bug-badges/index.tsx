// src/modules/common/components/bug-badges.tsx
import { Badge } from "@medusajs/ui"

// --- Status helpers ---

export const getStatusColor = (status: string) => {
  switch (status) {
    case "open": return "green"
    case "claimed": return "blue"
    case "fix submitted": return "orange"
    case "client approved": return "purple"
    case "client rejected": return "red"
    default: return "grey"
  }
}

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "open": return "Open"
    case "claimed": return "Claimed"
    case "fix submitted": return "Fix Submitted"
    case "client approved": return "Client Approved"
    case "client rejected": return "Client Rejected"
    default: return status
  }
}

export const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <Badge color={getStatusColor(status)} size="2xsmall" rounded="full">
    {label ?? getStatusLabel(status)}
  </Badge>
)

// --- Difficulty helpers ---

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy": return "green"
    case "medium": return "orange"
    case "hard": return "red"
    default: return "grey"
  }
}

export const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy": return "Easy"
    case "medium": return "Medium"
    case "hard": return "Hard"
    default: return difficulty
  }
}

export const DifficultyBadge = ({ difficulty }: { difficulty: string }) => (
  <Badge color={getDifficultyColor(difficulty)} size="2xsmall" rounded="full">
    {getDifficultyLabel(difficulty)}
  </Badge>
)
// src/modules/dashboard/components/stat-card/index.tsx
import { Container } from "@medusajs/ui"
import Link from "next/link"

type StatCardProps = {
  title: string
  value: string | number
  description?: string
  href?: string
}

const StatCard = ({ title, value, description, href }: StatCardProps) => {
  const content = (
    <Container
      className={`flex flex-col gap-y-2 p-6 h-full ${
        href ? "hover:bg-ui-bg-subtle transition-colors cursor-pointer" : ""
      }`}
    >
      <p className="text-ui-fg-muted text-sm font-medium">{title}</p>
      <p className="text-ui-fg-base text-3xl font-semibold">{value}</p>
      {description && (
        <p className="text-ui-fg-subtle text-xs">{description}</p>
      )}
    </Container>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}

export default StatCard
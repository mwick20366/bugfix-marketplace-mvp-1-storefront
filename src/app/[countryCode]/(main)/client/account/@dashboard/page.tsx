"use client"
import { Container } from "@medusajs/ui"
import { retrieveClient } from "@lib/data/client"
import { useQuery } from "@tanstack/react-query"
import StatCard from "@modules/dashboard/components/stat-card"

export default function ClientDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["client-me"],
    // TODO: switch to sdk call
    queryFn: () => fetch("/clients/me").then((res) => res.json()),
  })
  // const data = await retrieveClient().catch(() => null)

  console.log("Client Dashboard Data:", data) // Debugging log

  const dashboard = data?.dashboard
  const client = data?.client

  const formattedTotalSpent =
    dashboard?.total_spent != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(dashboard.total_spent)
      : "-"

  return (
    <div className="flex flex-col gap-y-6 p-6">
      <div className="flex flex-col gap-y-1">
        <h1 className="text-ui-fg-base text-2xl font-semibold">
          Welcome back{client?.first_name ? `, ${client.first_name}` : ""}
        </h1>
        <p className="text-ui-fg-muted text-sm">Here's an overview of your bugs.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Bugs"
          value={isLoading ? "..." : dashboard?.open_bugs ?? 0}
          description="Awaiting a developer"
          href="/client/account/my-bugs?status=open"
        />
        <StatCard
          title="In Progress"
          value={isLoading ? "..." : dashboard?.in_progress ?? 0}
          description="Claimed or fix submitted"
          href="/client/account/my-bugs?status=claimed&status=fix+submitted"
        />
        <StatCard
          title="Pending Approvals"
          value={isLoading ? "..." : dashboard?.pending_approvals ?? 0}
          description="Awaiting your review"
          href="/client/account/my-bugs?status=fix+submitted"
        />
        <StatCard
          title="Total Spent"
          value={isLoading ? "..." : formattedTotalSpent}
          description="Bounties paid out"
          href="/client/account/my-bugs?status=client+approved"
        />
      </div>
    </div>
  )
}
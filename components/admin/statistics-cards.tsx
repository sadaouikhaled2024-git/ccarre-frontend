"use client"

import { Card } from "@/components/ui/card"
import type { StatsResponse } from "@/lib/reports-admin-api"

interface StatisticsCardProps {
  stats: StatsResponse["data"]["summary"] | null
  loading?: boolean
}

export function StatisticsCards({ stats, loading }: StatisticsCardProps) {
  if (!stats)
    return (
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 bg-gray-100 animate-pulse h-24" />
        ))}
      </div>
    )

  return (
    <div className="grid grid-cols-5 gap-4">
      <Card className="p-4 border-l-4 border-l-[#1F0C11] bg-white hover:shadow-md transition-shadow">
        <p className="text-sm text-[#1F0C11]/60 font-medium">Total</p>
        <p className="text-2xl font-bold text-[#1F0C11] mt-2">{stats.total}</p>
      </Card>

      <Card className="p-4 border-l-4 border-l-[#EC7578] bg-[#EC7578]/5 hover:shadow-md transition-shadow">
        <p className="text-sm text-[#EC7578] font-medium">Ouvert</p>
        <p className="text-2xl font-bold text-[#EC7578] mt-2">{stats.open}</p>
      </Card>

      <Card className="p-4 border-l-4 border-l-[#FF7F50] bg-[#FF7F50]/5 hover:shadow-md transition-shadow">
        <p className="text-sm text-[#FF7F50] font-medium">En cours</p>
        <p className="text-2xl font-bold text-[#FF7F50] mt-2">{stats.inProgress}</p>
      </Card>

      <Card className="p-4 border-l-4 border-l-[#B44362] bg-[#B44362]/5 hover:shadow-md transition-shadow">
        <p className="text-sm text-[#B44362] font-medium">Résolu</p>
        <p className="text-2xl font-bold text-[#B44362] mt-2">{stats.resolved}</p>
      </Card>

      <Card className="p-4 border-l-4 border-l-gray-400 bg-gray-50 hover:shadow-md transition-shadow">
        <p className="text-sm text-gray-600 font-medium">Rejeté</p>
        <p className="text-2xl font-bold text-gray-700 mt-2">{stats.rejected}</p>
      </Card>
    </div>
  )
}

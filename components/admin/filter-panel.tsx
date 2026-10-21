"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ReportStatus, ReportType, ReportPriority, ReportReason } from "@/lib/reports-admin-api"

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void
  loading?: boolean
}

export interface FilterState {
  status?: ReportStatus
  type?: ReportType
  priority?: ReportPriority
  reason?: ReportReason
  page?: number
}

const statusOptions: ReportStatus[] = ["OUVERT", "EN_COURS", "RESOLU", "REJETE"]
const typeOptions: ReportType[] = ["annonce", "user", "message"]
const priorityOptions: ReportPriority[] = ["low", "normal", "high", "urgent"]
const reasonOptions: ReportReason[] = ["arnaque", "prix_suspect", "spam", "contenu_offensant", "autre"]

function getStatusColor(status: ReportStatus): string {
  switch (status) {
    case "OUVERT":
      return "bg-[#EC7578]/10 text-[#EC7578] border-[#EC7578]/20 hover:bg-[#EC7578]/20"
    case "EN_COURS":
      return "bg-[#FF7F50]/10 text-[#FF7F50] border-[#FF7F50]/20 hover:bg-[#FF7F50]/20"
    case "RESOLU":
      return "bg-[#B44362]/10 text-[#B44362] border-[#B44362]/20 hover:bg-[#B44362]/20"
    case "REJETE":
      return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
  }
}

function getPriorityColor(priority: ReportPriority): string {
  switch (priority) {
    case "urgent":
      return "bg-[#EC7578]/10 text-[#EC7578] border-[#EC7578]/20 hover:bg-[#EC7578]/20"
    case "high":
      return "bg-[#FF7F50]/10 text-[#FF7F50] border-[#FF7F50]/20 hover:bg-[#FF7F50]/20"
    case "normal":
      return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
    case "low":
      return "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
  }
}

export function FilterPanel({ onFilterChange, loading }: FiltersProps) {
  const handleFilterClick = (type: keyof FilterState, value: any) => {
    onFilterChange({ [type]: value === "all" ? undefined : value, page: 1 })
  }

  return (
    <Card className="p-6 border border-[#EC7578]/20">
      <h3 className="font-semibold text-[#1F0C11] mb-4">Filtres</h3>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <p className="text-sm font-medium text-[#1F0C11] mb-2">Statut</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("status", "all")}
              className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
            >
              Tous
            </Button>
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick("status", status)}
                className={`border ${getStatusColor(status)}`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <p className="text-sm font-medium text-[#1F0C11] mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("type", "all")}
              className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
            >
              Tous
            </Button>
            {typeOptions.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick("type", type)}
                className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <p className="text-sm font-medium text-[#1F0C11] mb-2">Priorité</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("priority", "all")}
              className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
            >
              Tous
            </Button>
            {priorityOptions.map((priority) => (
              <Button
                key={priority}
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick("priority", priority)}
                className={`border ${getPriorityColor(priority)}`}
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>

        {/* Reason Filter */}
        <div>
          <p className="text-sm font-medium text-[#1F0C11] mb-2">Raison</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick("reason", "all")}
              className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
            >
              Tous
            </Button>
            {reasonOptions.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick("reason", reason)}
                className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
              >
                {reason}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

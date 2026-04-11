"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Report } from "@/lib/reports-admin-api"

interface ReportsTableProps {
  reports: Report[]
  loading?: boolean
  onRowClick: (report: Report) => void
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

function getStatusColor(status: string): string {
  switch (status) {
    case "OUVERT":
      return "bg-[#EC7578] text-white"
    case "EN_COURS":
      return "bg-[#FF7F50] text-white"
    case "RESOLU":
      return "bg-[#B44362] text-white"
    case "REJETE":
      return "bg-gray-400 text-white"
    default:
      return "bg-gray-300 text-gray-700"
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-[#EC7578]/10 text-[#EC7578] border-[#EC7578]/20"
    case "high":
      return "bg-[#FF7F50]/10 text-[#FF7F50] border-[#FF7F50]/20"
    case "normal":
      return "bg-gray-100 text-gray-600 border-gray-200"
    case "low":
      return "bg-gray-50 text-gray-500 border-gray-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

export function ReportsTable({
  reports,
  loading,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
}: ReportsTableProps) {
  // Console logs for debugging
  console.log("ReportsTable - Reports count:", reports.length)
  console.log("ReportsTable - First report:", reports[0])
  console.log("ReportsTable - First report targetData:", reports[0]?.targetData)
  
  if (loading) {
    return (
      <Card className="p-4 border border-[#EC7578]/20">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  if (reports.length === 0) {
    return (
      <Card className="p-12 border border-[#EC7578]/20 text-center">
        <p className="text-[#1F0C11]/60">Aucun rapport trouvé</p>
      </Card>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(reports.map((r) => r._id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectReport = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id])
    } else {
      onSelectionChange?.(selectedIds.filter((sid) => sid !== id))
    }
  }

  return (
    <Card className="border border-[#EC7578]/20 overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#1F0C11] text-white">
          <tr>
            <th className="px-6 py-3 text-left">
              <Checkbox
                checked={selectedIds.length === reports.length && reports.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Target ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Contenu Signalé</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Priorité</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Raison</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Signalé par</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EC7578]/10">
          {reports.map((report) => (
            <tr
              key={report._id}
              className="hover:bg-[#1F0C11]/5 transition-colors cursor-pointer"
              onClick={() => onRowClick(report)}
            >
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(report._id)}
                  onCheckedChange={(checked) =>
                    handleSelectReport(report._id, checked as boolean)
                  }
                />
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  <p className="font-mono font-bold text-[#B44362]">{report.targetId ? report.targetId.slice(0, 12) : 'N/A'}...</p>
                  <p className="text-[#1F0C11]/60 text-xs">Report: {report._id.slice(0, 8)}...</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge variant="outline" className="border-[#B44362]/30 text-[#B44362]">
                  {report?.type ? report.type.toUpperCase() : 'N/A'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  {report?.type === 'annonce' && report.targetData?.title ? (
                    <p className="font-medium text-[#1F0C11]">{report.targetData.title}</p>
                  ) : report?.type === 'user' && report.targetData ? (
                    <p className="font-medium text-[#1F0C11]">{(report.targetData as any).firstName} {(report.targetData as any).lastName}</p>
                  ) : report?.type === 'message' && report.targetData?.expediteur ? (
                    <p className="font-medium text-[#1F0C11]">De: {report.targetData.expediteur.firstName}</p>
                  ) : (
                    <p className="text-[#1F0C11]/60 text-sm italic">Données non disponibles</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge variant="outline" className={getPriorityColor(report.priority)}>
                  {report.priority}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-[#1F0C11]/70">{report.reason}</td>
              <td className="px-6 py-4 text-sm">
                <p className="text-[#1F0C11] font-medium">
                  {report.reportedBy?.firstName || "N/A"} {report.reportedBy?.lastName || ""}
                </p>
                <p className="text-[#1F0C11]/60 text-xs">{report.reportedBy?.email || "N/A"}</p>
              </td>
              <td className="px-6 py-4 text-sm text-[#1F0C11]/70">
                {new Date(report.createdAt).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

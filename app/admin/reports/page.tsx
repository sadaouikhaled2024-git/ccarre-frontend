"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StatisticsCards } from "@/components/admin/statistics-cards"
import { FilterPanel, type FilterState } from "@/components/admin/filter-panel"
import { ReportsTable } from "@/components/admin/reports-table"
import { ReportDetailModal } from "@/components/admin/report-detail-modal"
import {
  reportsAdminApi,
  type Report,
  type ReportStatus,
  type AdminAction,
  type StatsResponse,
} from "@/lib/reports-admin-api"
import { showNotification } from "@/components/notification-toast"

export default function AdminReportsPage() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<StatsResponse["data"]["summary"] | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 })
  const [searchQuery, setSearchQuery] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (!token || user?.role !== "admin") {
      router.push("/")
    }
  }, [token, user, router])

  // Fetch statistics
  useEffect(() => {
    if (!token) return

    const fetchStats = async () => {
      try {
        const response = await reportsAdminApi.getStats(token)
        setStats(response.data.summary)
      } catch (error) {
        console.error("Error fetching stats:", error)
        showNotification({
          title: "Erreur",
          message: "Impossible de charger les statistiques",
          type: "error",
        })
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [token])

  // Fetch reports
  useEffect(() => {
    if (!token) return

    const fetchReports = async () => {
      try {
        setLoading(true)
        let response
        
        // Use search endpoint if search query exists, otherwise use getList
        if (searchQuery.trim()) {
          console.log("Searching with query:", searchQuery)
          response = await reportsAdminApi.search(
            {
              q: searchQuery,
              page: filters.page || 1,
              limit: 20,
            },
            token,
          )
        } else {
          response = await reportsAdminApi.getList(
            {
              ...filters,
              page: filters.page || 1,
              limit: 20,
            },
            token,
          )
        }
        
        console.log("AdminReportsPage - API Response:", response)
        console.log("AdminReportsPage - Reports data:", response.data)
        console.log("AdminReportsPage - First report:", response.data[0])
        console.log("AdminReportsPage - First report targetData:", response.data[0]?.targetData)
        
        setReports(response.data)
        setPagination({
          page: response.pagination.page,
          pages: response.pagination.pages,
          total: response.pagination.total,
          limit: response.pagination.limit,
        })
      } catch (error) {
        console.error("Error fetching reports:", error)
        showNotification({
          title: "Erreur",
          message: "Impossible de charger les rapports",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [filters, token, searchQuery])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setSelectedIds([])
  }

  const handleReportClick = (report: Report) => {
    // Show detail modal for all report types
    console.log("Opening modal for report:", report)
    setSelectedReport(report)
    setShowDetailModal(true)
  }

  const handleResolveReport = async (
    status: ReportStatus,
    action: AdminAction,
    notes: string,
  ) => {
    if (!selectedReport || !token) return

    try {
      await reportsAdminApi.resolve(selectedReport._id, status, action, notes, token)
      showNotification({
        title: "Succès",
        message: "Rapport mis à jour",
        type: "success",
      })

      // Refresh reports and stats
      setFilters({ ...filters })
      const response = await reportsAdminApi.getStats(token)
      setStats(response.data.summary)
    } catch (error) {
      console.error("Error resolving report:", error)
      showNotification({
        title: "Erreur",
        message: error instanceof Error ? error.message : "Impossible de mettre à jour le rapport",
        type: "error",
      })
    }
  }

  const handleBulkAction = async (action: AdminAction, status: ReportStatus = "RESOLU") => {
    if (selectedIds.length === 0 || !token) return

    try {
      await reportsAdminApi.bulkUpdate(selectedIds, status, action, "Bulk action", token)
      showNotification({
        title: "Succès",
        message: `${selectedIds.length} rapports mis à jour`,
        type: "success",
      })

      setSelectedIds([])
      setFilters({ ...filters })
      const response = await reportsAdminApi.getStats(token)
      setStats(response.data.summary)
    } catch (error) {
      console.error("Error bulk updating:", error)
      showNotification({
        title: "Erreur",
        message: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
        type: "error",
      })
    }
  }

  if (!token || user?.role !== "admin") {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-[#B44362] hover:text-[#B44362]/80 mb-4 w-fit">
              <ChevronLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#1F0C11] mb-2">Dashboard Admin</h1>
            <p className="text-[#1F0C11]/60">Gestion des rapports et modération</p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <StatisticsCards stats={stats} loading={!stats} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <FilterPanel onFilterChange={handleFilterChange} loading={loading} />
            </div>

            {/* Bulk Actions & Reports */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Rechercher par ID ou titre d'annonce..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-[#B44362]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B44362]/30"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <Card className="p-4 bg-[#B44362]/5 border border-[#B44362]/20">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[#B44362] font-medium">
                      {selectedIds.length} rapport{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#FF7F50]/30 text-[#FF7F50] hover:bg-[#FF7F50]/5"
                        onClick={() => handleBulkAction("WARN_USER")}
                      >
                        Avertir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#EC7578]/30 text-[#EC7578] hover:bg-[#EC7578]/5"
                        onClick={() => handleBulkAction("BAN_USER")}
                      >
                        Bannir
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#B44362] hover:bg-[#B44362]/90 text-white"
                        onClick={() => handleBulkAction("NONE")}
                      >
                        Marquer comme résolu
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Reports Table */}
              <ReportsTable
                reports={reports}
                loading={loading}
                onRowClick={handleReportClick}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters({ ...filters, page })}
                      className={
                        page === pagination.page
                          ? "bg-[#B44362] hover:bg-[#B44362]/90 text-white"
                          : "border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onResolve={handleResolveReport}
      />

      <Footer />
    </>
  )
}

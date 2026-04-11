"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import type { Report, ReportStatus, AdminAction } from "@/lib/reports-admin-api"

interface ReportDetailModalProps {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (status: ReportStatus, action: AdminAction, notes: string) => Promise<void>
  loading?: boolean
}

const statuses: ReportStatus[] = ["OUVERT", "EN_COURS", "RESOLU"]
const actions: AdminAction[] = ["NONE", "WARN_USER", "BAN_USER", "REMOVE_ANNONCE"]

function getStatusColor(status: ReportStatus): string {
  switch (status) {
    case "OUVERT":
      return "bg-[#EC7578] text-white"
    case "EN_COURS":
      return "bg-[#FF7F50] text-white"
    case "RESOLU":
      return "bg-[#B44362] text-white"
  }
}

function formatStatusFrench(status: string): string {
  switch (status?.toUpperCase()) {
    case "OUVERT":
      return "Ouvert"
    case "EN_COURS":
      return "En cours"
    case "RESOLU":
      return "Résolu"
    default:
      return status || "N/A"
  }
}

export function ReportDetailModal({
  report,
  open,
  onOpenChange,
  onResolve,
  loading,
}: ReportDetailModalProps) {
  const [action, setAction] = useState<AdminAction>("NONE")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Console logs for debugging
  console.log("ReportDetailModal - Report:", report)
  console.log("ReportDetailModal - Report Type:", report?.type)
  console.log("ReportDetailModal - TargetData:", report?.targetData)
  console.log("ReportDetailModal - Has targetData:", !!report?.targetData)

  // Determine status automatically based on action
  const determineStatus = (selectedAction: AdminAction): ReportStatus => {
    return selectedAction !== "NONE" ? "RESOLU" : "EN_COURS"
  }

  const handleResolve = async () => {
    if (!report) return
    try {
      setSubmitting(true)
      const finalStatus = determineStatus(action)
      await onResolve(finalStatus, action, notes)
      setNotes("")
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1F0C11]">Détails du Rapport</DialogTitle>
          <DialogDescription>
            Rapport ID: {report?._id.slice(0, 12)}...
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="space-y-6">
            {/* Report Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-[#1F0C11]/5">
                <p className="text-sm text-[#1F0C11]/60 mb-1">Type</p>
                <Badge variant="outline" className="border-[#B44362]/30 text-[#B44362]">
                  {report.type}
                </Badge>
              </Card>

              <Card className="p-4 bg-[#1F0C11]/5">
                <p className="text-sm text-[#1F0C11]/60 mb-1">Statut</p>
                <Badge className={getStatusColor(report.status)}>{formatStatusFrench(report.status)}</Badge>
              </Card>

              <Card className="p-4 bg-[#1F0C11]/5">
                <p className="text-sm text-[#1F0C11]/60 mb-1">Priorité</p>
                <p className="font-semibold text-[#1F0C11]">{report.priority}</p>
              </Card>

              <Card className="p-4 bg-[#1F0C11]/5">
                <p className="text-sm text-[#1F0C11]/60 mb-1">Raison</p>
                <p className="font-semibold text-[#1F0C11]">{report.reason}</p>
              </Card>
            </div>

            {/* Reporter Info */}
            <Card className="p-4 border border-[#EC7578]/20">
              <p className="text-sm font-semibold text-[#1F0C11] mb-3">Signalé par</p>
              <div className="space-y-2">
                <p className="text-[#1F0C11]">
                  <span className="font-medium">{report.reportedBy.firstName} {report.reportedBy.lastName}</span>
                </p>
                <p className="text-sm text-[#1F0C11]/60">{report.reportedBy.email}</p>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-4 border border-[#EC7578]/20">
              <p className="text-sm font-semibold text-[#1F0C11] mb-3">Description</p>
              <p className="text-[#1F0C11]/80 text-sm">{report.description}</p>
            </Card>

            {/* Contenu Signalé */}
            {report.targetData && (
              <Card className="p-4 border border-[#FF7F50]/20">
                <p className="text-sm font-semibold text-[#1F0C11] mb-4">
                  {report.type === 'annonce' ? 'Annonce Signalée' : 
                   report.type === 'user' ? 'Utilisateur Signalé' : 
                   'Message Signalé'}
                </p>
                
                <div className="space-y-3 text-sm">
                  {/* Annonce */}
                  {report.type === 'annonce' && (
                    <>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Titre</p>
                        <p className="text-[#1F0C11] font-medium">{report.targetData.title || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Propriétaire</p>
                        <p className="text-[#1F0C11]">{report.targetData.owner?.firstName} {report.targetData.owner?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Email du propriétaire</p>
                        <p className="text-[#1F0C11]">{report.targetData.owner?.email}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Catégorie</p>
                        <p className="text-[#1F0C11]">{report.targetData.category || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Prix</p>
                        <p className="text-[#1F0C11]">{report.targetData.price ? `${report.targetData.price}€` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Statut</p>
                        <p className="text-[#1F0C11]">{report.targetData.status || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Description</p>
                        <p className="text-[#1F0C11]">{report.targetData.description || 'N/A'}</p>
                      </div>
                      {report.targetData.images && report.targetData.images.length > 0 && (
                        <div>
                          <p className="text-[#1F0C11]/60 text-xs mb-3">Images ({report.targetData.images.length})</p>
                          <div className="grid grid-cols-2 gap-3">
                            {report.targetData.images.map((img, idx) => (
                              <div key={idx} className="rounded border border-[#B44362]/20 overflow-hidden bg-[#1F0C11]/5">
                                <img 
                                  src={img} 
                                  alt={`Image ${idx + 1}`}
                                  className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E"
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* User */}
                  {report.type === 'user' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[#1F0C11]/60 text-xs mb-1">Prénom</p>
                          <p className="text-[#1F0C11]">{(report.targetData as any).firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[#1F0C11]/60 text-xs mb-1">Nom</p>
                          <p className="text-[#1F0C11]">{(report.targetData as any).lastName || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Email</p>
                        <p className="text-[#1F0C11]">{(report.targetData as any).email || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[#1F0C11]/60 text-xs mb-1">Score de Risque</p>
                          <p className="text-[#1F0C11]">{report.targetData.riskScore ?? 0}/100</p>
                        </div>
                        <div>
                          <p className="text-[#1F0C11]/60 text-xs mb-1">Signalements</p>
                          <p className="text-[#1F0C11]">{report.targetData.reportCount ?? 0}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Statut</p>
                        <p className="text-[#1F0C11]">{report.targetData.isBanned ? '🚫 Banni' : '✓ Actif'}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Créé le</p>
                        <p className="text-[#1F0C11]">{report.targetData.createdAt ? new Date(report.targetData.createdAt as any).toLocaleDateString('fr-FR') : 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* Message */}
                  {report.type === 'message' && (
                    <>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Expéditeur</p>
                        <p className="text-[#1F0C11]">{report.targetData.expediteur?.firstName} {report.targetData.expediteur?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Email de l'expéditeur</p>
                        <p className="text-[#1F0C11]">{report.targetData.expediteur?.email}</p>
                      </div>
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Contenu</p>
                        <p className="text-[#1F0C11] whitespace-pre-wrap">{report.targetData.contenu || 'N/A'}</p>
                      </div>
                      {report.targetData.images && report.targetData.images.length > 0 && (
                        <div>
                          <p className="text-[#1F0C11]/60 text-xs mb-3">Images ({report.targetData.images.length})</p>
                          <div className="grid grid-cols-2 gap-3">
                            {report.targetData.images.map((img, idx) => (
                              <div key={idx} className="rounded border border-[#B44362]/20 overflow-hidden bg-[#1F0C11]/5">
                                <img 
                                  src={img} 
                                  alt={`Image ${idx + 1}`}
                                  className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E"
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-[#1F0C11]/60 text-xs mb-1">Date/Heure</p>
                        <p className="text-[#1F0C11]">{report.targetData.timestamp ? new Date(report.targetData.timestamp as any).toLocaleDateString('fr-FR') : 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Admin Actions */}
            <Card className="p-4 border border-[#B44362]/20 bg-[#B44362]/5">
              <p className="text-sm font-semibold text-[#1F0C11] mb-4">Actions Administrateur</p>

              <div className="space-y-4">
                {/* Action */}
                <div>
                  <label className="text-sm font-medium text-[#1F0C11] block mb-2">
                    Action
                  </label>
                  <Select value={action} onValueChange={(v) => setAction(v as AdminAction)}>
                    <SelectTrigger className="border-[#B44362]/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a === "NONE" ? "Aucune action" :
                           a === "WARN_USER" ? "Avertir l'utilisateur" :
                           a === "BAN_USER" ? "Bannir l'utilisateur" :
                           "Supprimer l'annonce"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-[#1F0C11] block mb-2">
                    Notes Administrateur
                  </label>
                  <Textarea
                    placeholder="Explications et raisons de cette action..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-[#B44362]/30 focus:border-[#B44362]"
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
          >
            Fermer
          </Button>
          <Button
            onClick={handleResolve}
            disabled={submitting}
            className="bg-[#B44362] hover:bg-[#B44362]/90 text-white"
          >
            {submitting ? "En cours..." : "Appliquer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

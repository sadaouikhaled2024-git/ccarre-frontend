'use client';

import React, { useEffect, useState } from 'react';
import { getReports, updateReportStatus, deleteReport } from '../../../lib/admin-api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flag, User, Clock, Trash2, Eye } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [status, priority, page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports(status, priority, page, 10);
      setReports(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedReport) return;

    try {
      setError(null);
      await updateReportStatus(
        selectedReport._id,
        updateStatus || selectedReport.status,
        updatePriority || selectedReport.priority,
        adminNotes || undefined,
      );
      setSuccessMessage('Signalement mis à jour avec succès');
      setUpdateModalOpen(false);
      setSelectedReport(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchReports();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMsg);
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce signalement?')) {
      try {
        setError(null);
        await deleteReport(id);
        setSuccessMessage('Signalement supprimé avec succès');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchReports();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
        setError(errorMsg);
        console.error('Erreur:', err);
      }
    }
  };

  const openUpdateModal = (report: any) => {
    setError(null);
    setSelectedReport(report);
    setUpdateStatus(report.status);
    setUpdatePriority(report.priority);
    setAdminNotes(report.adminNotes || '');
    setUpdateModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Erreur</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <div className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">✓</div>
              <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Gestion des Signalements</h1>
            <p className="text-muted-foreground">Modérez et gérez tous les signalements des utilisateurs</p>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Statut</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">Tous</option>
                <option value="ouvert">Ouverts</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolus</option>
                <option value="rejete">Rejetés</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priorité</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">Tous</option>
                <option value="urgent">Urgent</option>
                <option value="high">Élevé</option>
                <option value="normal">Normal</option>
                <option value="low">Bas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Stats</label>
              <div className="text-sm text-muted-foreground pt-2">
                Total: <span className="font-semibold text-foreground">{total}</span>
              </div>
            </div>
          </div>

          {/* Rapports */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Chargement...</p>
            </div>
          ) : reports.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Aucun signalement trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Flag className="w-4 h-4 text-red-500" />
                            <h3 className="font-semibold text-foreground capitalize">{report.type}</h3>
                            <StatusBadge status={report.status} />
                            <PriorityBadge priority={report.priority} />
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3"><strong>Raison:</strong> {report.reason}</p>
                          <p className="text-sm text-muted-foreground mb-3"><strong>Description:</strong> {report.description}</p>
                          
                          {/* Annonce Details if available */}
                          {report.annonce && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                              <p className="font-medium text-blue-900 dark:text-blue-300 mb-2">Annonce signalée</p>
                              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                                <p><strong>Titre:</strong> {report.annonce.title}</p>
                                {report.annonce.description && <p><strong>Description:</strong> {report.annonce.description.substring(0, 100)}...</p>}
                                <p><strong>Score de risque:</strong> <span className="font-semibold">{report.annonce.riskScore || 0}</span></p>
                                <p><strong>Nombre de signalements:</strong> <span className="font-semibold">{report.annonce.reportCount || 0}</span></p>
                              </div>
                            </div>
                          )}

                          {/* User Details if available */}
                          {report.user && (
                            <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded">
                              <p className="font-medium text-orange-900 dark:text-orange-300 mb-2">Utilisateur signalé</p>
                              <div className="space-y-1 text-sm text-orange-800 dark:text-orange-400">
                                <p><strong>Nom:</strong> {report.user.firstName} {report.user.lastName}</p>
                                <p><strong>Email:</strong> {report.user.email}</p>
                                <p><strong>Score de risque:</strong> <span className="font-semibold">{report.user.riskScore || 0}</span></p>
                                <p><strong>Nombre de signalements:</strong> <span className="font-semibold">{report.user.reportCount || 0}</span></p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{report.reportedBy?.firstName} {report.reportedBy?.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          {report.adminNotes && (
                            <div className="mt-3 p-3 bg-muted rounded text-sm">
                              <p className="font-medium text-foreground mb-1">Notes admin:</p>
                              <p className="text-muted-foreground">{report.adminNotes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => openUpdateModal(report)}
                            className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
                            title="Modifier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition text-red-600 dark:text-red-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} • Total: {total} signalements
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 10 >= total}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Modal */}
          {updateModalOpen && selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Modifier le signalement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Statut</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="ouvert">Ouvert</option>
                      <option value="en_cours">En cours</option>
                      <option value="resolu">Résolu</option>
                      <option value="rejete">Rejeté</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Priorité</label>
                    <select
                      value={updatePriority}
                      onChange={(e) => setUpdatePriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">Élevé</option>
                      <option value="normal">Normal</option>
                      <option value="low">Bas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ajouter des notes..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        setUpdateModalOpen(false);
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    ouvert: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    en_cours: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    resolu: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    rejete: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <Badge className={statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityStyles: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  };

  return (
    <Badge className={priorityStyles[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'}>
      {priority}
    </Badge>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { getAnnonces, deleteAnnonce, hardDeleteAnnonce, getAnnonceDetail } from '../../../lib/admin-api';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, AlertTriangle, X } from 'lucide-react';

function RiskBadge({ score }: { score: number }) {
  if (score >= 80) {
    return <Badge className="bg-destructive text-white">🔴 Critique ({score})</Badge>;
  } else if (score >= 50) {
    return <Badge className="bg-yellow-600 text-white">🟡 Élevé ({score})</Badge>;
  } else if (score >= 20) {
    return <Badge className="bg-orange-600 text-white">🟠 Moyen ({score})</Badge>;
  }
  return <Badge className="text-white" style={{ backgroundColor: "#B44362" }}>🟢 Faible ({score})</Badge>;
}

export default function AdminAnnonces() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnnonce, setSelectedAnnonce] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  useEffect(() => {
    fetchAnnonces();
  }, [filter, page]);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const data = await getAnnonces(filter, page, 10);
      setAnnonces(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'soft' | 'hard' = 'soft') => {
    setShowDeleteModal(true);
    setSelectedAnnonce({ _id: id, title: 'Annonce' });
    setDeleteType(type);
  };

  const confirmDelete = async () => {
    if (!selectedAnnonce?._id) return;

    try {
      if (deleteType === 'hard') {
        await hardDeleteAnnonce(selectedAnnonce._id, 'Suppression définitive par administrateur');
        alert('Annonce supprimée définitivement');
      } else {
        await deleteAnnonce(selectedAnnonce._id, 'Suppression par administrateur');
        alert('Annonce marquée comme supprimée');
      }
      setShowDeleteModal(false);
      setSelectedAnnonce(null);
      fetchAnnonces();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await getAnnonceDetail(id);
      setSelectedAnnonce(detail);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 w-fit">
              <ChevronLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Gestion des Annonces</h1>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'reported', label: 'Signalées' },
              { value: 'suspicious', label: 'Suspectes' },
              { value: 'high-risk', label: 'Haut risque' },
            ].map((f) => (
              <Button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                variant={filter === f.value ? 'default' : 'outline'}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Tableau */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
            </div>
          ) : (
            <>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Titre</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Propriétaire</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Signalements</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Score Risque</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {annonces.map((annonce) => (
                        <tr key={annonce._id} className="hover:bg-muted/50 transition">
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium truncate">{annonce.title}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {annonce.owner?.firstName} {annonce.owner?.lastName}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={annonce.reportCount > 0 ? 'destructive' : 'outline'}>
                              {annonce.reportCount}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <RiskBadge score={annonce.riskScore} />
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => handleViewDetail(annonce._id)}
                                size="sm"
                                variant="outline"
                              >
                                Détail
                              </Button>
                              <Button
                                onClick={() => handleDelete(annonce._id, 'soft')}
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:bg-orange-50"
                              >
                                Archive
                              </Button>
                              <Button
                                onClick={() => handleDelete(annonce._id, 'hard')}
                                size="sm"
                                variant="destructive"
                              >
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total: {total} annonces | Page {page}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    ← Précédent
                  </Button>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 10 >= total}
                    variant="outline"
                  >
                    Suivant →
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Modal Détail */}
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{selectedAnnonce?.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedAnnonce?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Type</h3>
                      <p className="text-sm text-muted-foreground capitalize">{selectedAnnonce?.type}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Score Risque</h3>
                      <p className="text-sm text-muted-foreground">{selectedAnnonce?.riskScore}/100</p>
                    </div>
                  </div>

                  {selectedAnnonce?.suspiciousReasons && selectedAnnonce.suspiciousReasons.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Raisons Suspectes</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAnnonce.suspiciousReasons.map((reason: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAnnonce?.reports && selectedAnnonce.reports.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Signalements ({selectedAnnonce.reports.length})</h3>
                      <div className="space-y-2">
                        {selectedAnnonce.reports.map((report: any) => (
                          <Card key={report._id} className="p-3">
                            <p className="text-sm font-medium">
                              {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{report.reason}</p>
                            <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Confirmation Suppression */}
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  {deleteType === 'hard' 
                    ? '⚠️ SUPPRESSION DÉFINITIVE - Cette action ne peut pas être annulée. L\'annonce sera complètement supprimée de la base de données.'
                    : 'Marquer cette annonce comme supprimée (elle reste en base de données comme archive).'
                  }
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </Button>
                <Button 
                  variant={deleteType === 'hard' ? 'destructive' : 'default'}
                  onClick={confirmDelete}
                >
                  {deleteType === 'hard' ? 'Supprimer définitivement' : 'Archiver'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}

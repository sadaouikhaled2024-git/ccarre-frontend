'use client';

import React, { useEffect, useState } from 'react';
import { getUsers, banUser, unbanUser, deleteUser } from '../../../lib/admin-api';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertTriangle, ChevronLeft, Trash2 } from 'lucide-react';

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

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(filter, page, 10);
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!selectedUserId || !banReason) {
      alert('Veuillez entrer une raison');
      return;
    }

    try {
      await banUser(selectedUserId, banReason);
      setBanModalOpen(false);
      setSelectedUserId(null);
      setBanReason('');
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUnban = async (userId: string) => {
    if (confirm('Débannir cet utilisateur?')) {
      try {
        await unbanUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;

    try {
      await deleteUser(selectedUserId);
      setDeleteModalOpen(false);
      setSelectedUserId(null);
      fetchUsers();
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
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
            <h1 className="text-4xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'banned', label: 'Bannis' },
              { value: 'high-risk', label: 'Haut risque' },
              { value: 'suspected', label: 'Suspects' },
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
                        <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Score Risque</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-muted/50 transition">
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                          <td className="px-6 py-4">
                            <RiskBadge score={user.riskScore} /></td>
                          <td className="px-6 py-4">
                            {user.isBanned ? (
                              <Badge className="bg-destructive text-white">🚫 Banni</Badge>
                            ) : (
                              <Badge className="text-white" style={{ backgroundColor: "#FF7F50" }}>✓ Actif</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              {user.isBanned ? (
                                <Button
                                  onClick={() => handleUnban(user._id)}
                                  size="sm"
                                  variant="outline"
                                  style={{ color: "#FF7F50" }}
                                >
                                  Débannir
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => {
                                    setSelectedUserId(user._id);
                                    setBanModalOpen(true);
                                  }}
                                  size="sm"
                                  variant="destructive"
                                >
                                  Bannir
                                </Button>
                              )}
                              <Button
                                onClick={() => {
                                  setSelectedUserId(user._id);
                                  setDeleteModalOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
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
                  Total: {total} utilisateurs | Page {page}
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

          {/* Modal Ban */}
          <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bannir l'utilisateur</DialogTitle>
                <DialogDescription>
                  Entrez la raison du bannissement
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Raison du bannissement..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setBanModalOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleBan}>
                  Bannir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Delete */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Supprimer l'utilisateur</DialogTitle>
                <DialogDescription>
                  ⚠️ Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur et tous ses comptes et messages?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Supprimer définitivement
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

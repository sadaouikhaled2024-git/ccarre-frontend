'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAnalytics } from '../../../lib/admin-api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const MOCK_ANALYTICS = {
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString(),
  deletedAnnonces: 4,
  bannedUsersCount: 3,
  sentMessages: 248,
  newAnnonces: 45,
  newReports: 12,
  newUsers: 8,
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(MOCK_ANALYTICS);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching analytics for period:', period);
      const data = await getAnalytics(period);
      console.log('Analytics data received:', data);
      if (data) {
        setAnalytics(data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error fetching analytics:', errorMsg);
      setError(errorMsg);
      console.log('Keeping mock data as fallback');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const chartData = [
    { name: 'Ann. Sup.', value: analytics.deletedAnnonces || 0 },
    { name: 'Users Bannis', value: analytics.bannedUsersCount || 0 },
    { name: 'Messages', value: analytics.sentMessages || 0 },
    { name: 'Ann. Créées', value: analytics.newAnnonces || 0 },
    { name: 'Signalements', value: analytics.newReports || 0 },
    { name: 'Nouv. Users', value: analytics.newUsers || 0 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Note:</strong> {error} (utilisation des données de test)
              </p>
            </div>
          )}
          
          <div className="mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 w-fit">
              <ChevronLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
          </div>

          {/* Période */}
          <div className="mb-6 flex gap-2">
            {['7d', '30d', '90d'].map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={period === p ? 'default' : 'outline'}
              >
                {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
              </Button>
            ))}
          </div>

          {/* Infos Périodde */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                Données du {analytics?.startDate ? new Date(analytics.startDate).toLocaleDateString('fr-FR') : 'N/A'} au{' '}
                {analytics?.endDate ? new Date(analytics.endDate).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </CardContent>
          </Card>

          {/* Cartes Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Annonces Supprimées</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.deletedAnnonces || 0}</p>
                  </div>
                  <div className="text-4xl">🗑️</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateurs Bannis</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.bannedUsersCount || 0}</p>
                  </div>
                  <div className="text-4xl">🚫</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Messages Envoyés</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.sentMessages || 0}</p>
                  </div>
                  <div className="text-4xl">💬</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Annonces Créées</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.newAnnonces || 0}</p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Signalements</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.newReports || 0}</p>
                  </div>
                  <div className="text-4xl">🚩</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nouveaux Utilisateurs</p>
                    <p className="text-3xl font-bold mt-2">{analytics?.newUsers || 0}</p>
                  </div>
                  <div className="text-4xl">👤</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphique */}
          {Array.isArray(chartData) && chartData.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Activité Globale</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Résumé */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Modération Intensive</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {(analytics?.deletedAnnonces || 0) + (analytics?.bannedUsersCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Annonces supprimées + Bans</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-2xl font-bold mt-1">{analytics?.sentMessages || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Messages échangés</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Croissance</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {(analytics?.newAnnonces || 0) + (analytics?.newUsers || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Nouvelles annonces + Utilisateurs</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Conformité</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600">{analytics?.newReports || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Signalements traités</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

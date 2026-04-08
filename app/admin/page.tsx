'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getDashboardStats } from '../../lib/admin-api';
import Link from 'next/link';
import { AlertTriangle, Users, Package, Flag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

interface Stats {
  totalAnnonces: number;
  reportedAnnonces: number;
  highRiskAnnonces: number;
  totalUsers: number;
  bannedUsers: number;
  totalReports: number;
  openReports: number;
  urgentReports: number;
}

const MOCK_STATS: Stats = {
  totalAnnonces: 156,
  reportedAnnonces: 12,
  highRiskAnnonces: 3,
  totalUsers: 42,
  bannedUsers: 2,
  totalReports: 18,
  openReports: 5,
  urgentReports: 1,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAnnonces: 156,
    reportedAnnonces: 12,
    highRiskAnnonces: 3,
    totalUsers: 42,
    bannedUsers: 2,
    totalReports: 18,
    openReports: 5,
    urgentReports: 1,
  });
  const [error, setError] = useState<string | null>(null);

  // Log whenever stats changes
  useEffect(() => {
    console.log('=== STATS STATE UPDATED ===');
    console.log('Stats object:', stats);
    console.log('totalAnnonces:', stats.totalAnnonces);
    console.log('totalUsers:', stats.totalUsers);
  }, [stats]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      console.log('=== Admin: Attempting to fetch dashboard stats ===');
      const statsData = await getDashboardStats();
      console.log('=== Admin: Stats fetched successfully ===');
      console.log('Stats data received:', statsData);
      console.log('Stats data type:', typeof statsData);
      console.log('Stats data keys:', statsData ? Object.keys(statsData) : 'null/undefined');
      
      if (statsData && typeof statsData === 'object') {
        console.log('Setting stats state with:');
        console.log('  totalAnnonces:', statsData.totalAnnonces);
        console.log('  totalUsers:', statsData.totalUsers);
        console.log('  openReports:', statsData.openReports);
        setStats(statsData);
      } else {
        console.warn('Received invalid stats data, keeping mock data');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('=== Admin: Error fetching stats ===');
      console.error('Error message:', errorMsg);
      setError(errorMsg);
      console.log('Keeping mock data as fallback');
    }
  }, []);

  useEffect(() => {
    // Don't wait for loading to complete, show mock data immediately
    fetchData();
  }, [fetchData]);

  const riskData = [
    {
      name: 'Annonces standard',
      value: stats.totalAnnonces - stats.reportedAnnonces,
      fill: '#22c55e',
    },
    {
      name: 'Annonces signalées',
      value: stats.reportedAnnonces - stats.highRiskAnnonces,
      fill: '#f97316',
    },
    {
      name: 'Annonces haut risque',
      value: stats.highRiskAnnonces,
      fill: '#ef4444',
    },
  ];

  const urgencyData = [
    { name: 'Signalements urgent', value: stats.urgentReports, fill: '#ef4444' },
    { name: 'Signalements standard', value: stats.openReports - stats.urgentReports, fill: '#f97316' },
    { name: 'Signalements fermés', value: stats.totalReports - stats.openReports, fill: '#22c55e' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          {/* Quick Debug */}
          

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Erreur API:</strong> {error} (utilisation des données de test)
              </p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Admin</h1>
            <p className="text-muted-foreground">Surveillance et modération de la plateforme</p>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAnnonces}</div>
                <p className="text-xs text-muted-foreground">annonces actives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">inscrits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signalements</CardTitle>
                <Flag className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openReports}</div>
                <p className="text-xs text-muted-foreground">ouverts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Haut Risque</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highRiskAnnonces}</div>
                <p className="text-xs text-muted-foreground">annonces critiques</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerte */}
          {stats.urgentReports > 0 && (
            <Card className="mb-8 border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-foreground">Alertes en temps réel</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.urgentReports} signalements urgents | {stats.bannedUsers} utilisateurs bannis | {stats.highRiskAnnonces} annonces suspects
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des risques</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value }) => value}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {riskData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Urgence des signalements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={urgencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value }) => value}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {urgencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {urgencyData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/annonces">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className="font-semibold text-foreground">Gestion Annonces</h3>
                  <p className="text-sm text-muted-foreground mt-1">Voir les annonces suspects</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">👥</div>
                  <h3 className="font-semibold text-foreground">Gestion Utilisateurs</h3>
                  <p className="text-sm text-muted-foreground mt-1">Gérer les bans et risques</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reports">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">🚩</div>
                  <h3 className="font-semibold text-foreground">Signalements</h3>
                  <p className="text-sm text-muted-foreground mt-1">Traiter les signalements</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/analytics">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold text-foreground">Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">Voir les statistiques</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

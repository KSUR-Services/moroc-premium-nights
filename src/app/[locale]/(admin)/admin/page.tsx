'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Eye,
  FileEdit,
  Building2,
  Plus,
  FolderOpen,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { CITY_LABELS } from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface DashboardStats {
  total_venues: number;
  published: number;
  draft: number;
  archived: number;
  by_city: Record<string, number>;
  total_collections: number;
  sponsored: number;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
  details?: string;
}

// ──────────────────────────────────────────────
// Stat Card Component
// ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-[#D4AF37]',
  bgColor = 'bg-[#D4AF37]/10',
  trend,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
  trend?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg ${bgColor} p-2.5`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Dashboard Page
// ──────────────────────────────────────────────

export default function AdminDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch stats and recent logs in parallel
      const [statsRes, logsRes] = await Promise.allSettled([
        fetch('/api/admin/venues?stats=true'),
        fetch('/api/admin/venues?recent_logs=true&limit=10'),
      ]);

      // Parse stats
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const statsData = await statsRes.value.json();
        setStats(statsData.stats || generateMockStats());
      } else {
        // Use mock data during development
        setStats(generateMockStats());
      }

      // Parse logs
      if (logsRes.status === 'fulfilled' && logsRes.value.ok) {
        const logsData = await logsRes.value.json();
        setRecentLogs(logsData.logs || generateMockLogs());
      } else {
        setRecentLogs(generateMockLogs());
      }
    } catch {
      setError('Failed to load dashboard data');
      setStats(generateMockStats());
      setRecentLogs(generateMockLogs());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your nightlife directory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href={`/${locale}/admin/venues/new`}
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-[#E5C349] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Venue
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error} - Showing sample data</span>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Venues"
            value={stats.total_venues}
            icon={MapPin}
          />
          <StatCard
            label="Published"
            value={stats.published}
            icon={Eye}
            color="text-emerald-400"
            bgColor="bg-emerald-400/10"
          />
          <StatCard
            label="Drafts"
            value={stats.draft}
            icon={FileEdit}
            color="text-amber-400"
            bgColor="bg-amber-400/10"
          />
          <StatCard
            label="Sponsored"
            value={stats.sponsored}
            icon={TrendingUp}
            color="text-purple-400"
            bgColor="bg-purple-400/10"
          />
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Venues by City */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Venues by City</h2>
            <Building2 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="space-y-3">
            {stats &&
              Object.entries(stats.by_city)
                .sort(([, a], [, b]) => b - a)
                .map(([city, count]) => {
                  const maxCount = Math.max(...Object.values(stats.by_city));
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <div key={city}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {CITY_LABELS[city as keyof typeof CITY_LABELS] || city}
                        </span>
                        <span className="font-medium text-white">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C349] transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <Clock className="h-4 w-4 text-gray-500" />
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">
              No recent activity
            </div>
          ) : (
            <div className="space-y-1">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-800/50 transition-colors"
                >
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      log.action === 'created'
                        ? 'bg-emerald-400'
                        : log.action === 'updated'
                        ? 'bg-amber-400'
                        : log.action === 'deleted'
                        ? 'bg-red-400'
                        : log.action === 'published'
                        ? 'bg-blue-400'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-gray-300">
                      <span className="font-medium text-white">{log.entity_name}</span>
                      {' '}
                      <span className="text-gray-500">was</span>
                      {' '}
                      <span
                        className={
                          log.action === 'created'
                            ? 'text-emerald-400'
                            : log.action === 'updated'
                            ? 'text-amber-400'
                            : log.action === 'deleted'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }
                      >
                        {log.action}
                      </span>
                    </p>
                    {log.details && (
                      <p className="mt-0.5 truncate text-xs text-gray-600">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-600">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="Add New Venue"
          description="Create a new nightlife venue listing"
          icon={Plus}
          href={`/${locale}/admin/venues/new`}
        />
        <QuickActionCard
          title="Manage Venues"
          description="View and edit all venue listings"
          icon={MapPin}
          href={`/${locale}/admin/venues`}
        />
        <QuickActionCard
          title="Collections"
          description="Organize venues into curated collections"
          icon={FolderOpen}
          href={`/${locale}/admin/collections`}
        />
        <QuickActionCard
          title="Settings"
          description="Configure site settings and preferences"
          icon={Building2}
          href={`/${locale}/admin/settings`}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Quick Action Card
// ──────────────────────────────────────────────

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5
        hover:border-[#D4AF37]/30 hover:bg-gray-900/80 transition-all duration-200"
    >
      <div className="rounded-lg bg-gray-800 p-2.5 group-hover:bg-[#D4AF37]/10 transition-colors">
        <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
            {title}
          </h3>
          <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
        </div>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function generateMockStats(): DashboardStats {
  return {
    total_venues: 47,
    published: 32,
    draft: 12,
    archived: 3,
    by_city: {
      casablanca: 15,
      marrakech: 12,
      rabat: 8,
      tangier: 5,
      agadir: 4,
      fes: 2,
      essaouira: 1,
    },
    total_collections: 8,
    sponsored: 5,
  };
}

function generateMockLogs(): AuditLog[] {
  const now = Date.now();
  return [
    {
      id: '1',
      action: 'published',
      entity_type: 'venue',
      entity_name: 'Sky Bar Casablanca',
      created_at: new Date(now - 15 * 60000).toISOString(),
      details: 'Status changed from draft to published',
    },
    {
      id: '2',
      action: 'created',
      entity_type: 'venue',
      entity_name: 'Le Comptoir Darna',
      created_at: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: '3',
      action: 'updated',
      entity_type: 'venue',
      entity_name: 'Pacha Marrakech',
      created_at: new Date(now - 5 * 3600000).toISOString(),
      details: 'Updated photos and description',
    },
    {
      id: '4',
      action: 'created',
      entity_type: 'collection',
      entity_name: 'Best Rooftops in Casablanca',
      created_at: new Date(now - 8 * 3600000).toISOString(),
    },
    {
      id: '5',
      action: 'updated',
      entity_type: 'venue',
      entity_name: 'Theatro Marrakech',
      created_at: new Date(now - 12 * 3600000).toISOString(),
      details: 'Updated pricing and contact info',
    },
    {
      id: '6',
      action: 'published',
      entity_type: 'venue',
      entity_name: 'So Lounge Marrakech',
      created_at: new Date(now - 24 * 3600000).toISOString(),
    },
    {
      id: '7',
      action: 'deleted',
      entity_type: 'venue',
      entity_name: 'Test Venue',
      created_at: new Date(now - 36 * 3600000).toISOString(),
    },
    {
      id: '8',
      action: 'created',
      entity_type: 'venue',
      entity_name: 'Bazaar Bar Tangier',
      created_at: new Date(now - 48 * 3600000).toISOString(),
    },
    {
      id: '9',
      action: 'updated',
      entity_type: 'collection',
      entity_name: 'Top Nightclubs Marrakech',
      created_at: new Date(now - 72 * 3600000).toISOString(),
      details: 'Added 3 new venues',
    },
    {
      id: '10',
      action: 'created',
      entity_type: 'venue',
      entity_name: 'Ruby Lounge Rabat',
      created_at: new Date(now - 96 * 3600000).toISOString(),
    },
  ];
}

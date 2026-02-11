'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  X,
} from 'lucide-react';
import {
  CITIES,
  CATEGORIES,
  VENUE_STATUSES,
  CITY_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  priority_score: number;
  is_sponsored: boolean;
  updated_at: string;
  created_at: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

type SortField = 'name' | 'city' | 'category' | 'status' | 'priority_score' | 'updated_at';
type SortOrder = 'asc' | 'desc';

// ──────────────────────────────────────────────
// Venues List Page
// ──────────────────────────────────────────────

export default function VenuesListPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  // Data
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 25;
  const [totalCount, setTotalCount] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActioning, setIsBulkActioning] = useState(false);

  // Active row menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // ── Toast auto-dismiss ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Fetch venues ──
  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set('search', searchQuery);
      if (filterCity) queryParams.set('city', filterCity);
      if (filterCategory) queryParams.set('category', filterCategory);
      if (filterStatus) queryParams.set('status', filterStatus);
      queryParams.set('sort_by', sortField);
      queryParams.set('sort_order', sortOrder);
      queryParams.set('page', String(currentPage));
      queryParams.set('per_page', String(perPage));

      const res = await fetch(`/api/admin/venues?${queryParams.toString()}`);

      if (res.ok) {
        const data = await res.json();
        setVenues(data.venues || []);
        setTotalCount(data.total || 0);
      } else {
        // Use mock data if API is not yet connected
        setVenues(generateMockVenues());
        setTotalCount(47);
      }
    } catch {
      setVenues(generateMockVenues());
      setTotalCount(47);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterCity, filterCategory, filterStatus, sortField, sortOrder, currentPage]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // ── Filtering / sorting computed ──
  const filteredVenues = useMemo(() => {
    let result = [...venues];

    // Client-side search (supplement to server-side)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [venues, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  // ── Sort handler ──
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // ── Selection handlers ──
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredVenues.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVenues.map((v) => v.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Bulk actions ──
  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.size === 0) return;

    const confirmMsg =
      action === 'delete'
        ? `Delete ${selectedIds.size} venue(s)? This cannot be undone.`
        : `${action === 'publish' ? 'Publish' : 'Unpublish'} ${selectedIds.size} venue(s)?`;

    if (!confirm(confirmMsg)) return;

    setIsBulkActioning(true);
    try {
      const ids = Array.from(selectedIds);

      // Perform action for each venue
      const results = await Promise.allSettled(
        ids.map((id) => {
          if (action === 'delete') {
            return fetch(`/api/admin/venues/${id}`, { method: 'DELETE' });
          }
          return fetch(`/api/admin/venues/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: action === 'publish' ? 'published' : 'draft',
            }),
          });
        })
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      setToast({
        type: 'success',
        message: `${succeeded} venue(s) ${action === 'delete' ? 'deleted' : action === 'publish' ? 'published' : 'unpublished'} successfully`,
      });
      setSelectedIds(new Set());
      fetchVenues();
    } catch {
      setToast({ type: 'error', message: 'Bulk action failed' });
    } finally {
      setIsBulkActioning(false);
    }
  };

  // ── Single venue actions ──
  const handleDeleteVenue = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/venues/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', message: `"${name}" deleted` });
        fetchVenues();
      } else {
        setToast({ type: 'error', message: 'Failed to delete venue' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error' });
    }
    setActiveMenu(null);
  };

  const handleToggleStatus = async (venue: Venue) => {
    const newStatus = venue.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/venues/${venue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setToast({ type: 'success', message: `"${venue.name}" ${newStatus}` });
        fetchVenues();
      } else {
        setToast({ type: 'error', message: 'Failed to update status' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error' });
    }
    setActiveMenu(null);
  };

  // ── Clear filters ──
  const hasActiveFilters = filterCity || filterCategory || filterStatus;

  const clearFilters = () => {
    setFilterCity('');
    setFilterCategory('');
    setFilterStatus('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Venues</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all nightlife venue listings ({totalCount} total)
          </p>
        </div>
        <Link
          href={`/${locale}/admin/venues/new`}
          className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-[#E5C349] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Venue
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search venues by name..."
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 pl-10 pr-4
                text-sm text-white placeholder-gray-500 outline-none
                focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              hasActiveFilters || showFilters
                ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-gray-950">
                {[filterCity, filterCategory, filterStatus].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="relative">
              <select
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-8 text-sm text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {CITY_LABELS[c]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-8 text-sm text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-8 text-sm text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="">All Statuses</option>
                {VENUE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3">
          <span className="text-sm font-medium text-[#D4AF37]">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={isBulkActioning}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              disabled={isBulkActioning}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isBulkActioning}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-gray-500 hover:text-white"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredVenues.length && filteredVenues.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#D4AF37] focus:ring-[#D4AF37]/30"
                  />
                </th>
                {[
                  { key: 'name' as SortField, label: 'Name' },
                  { key: 'city' as SortField, label: 'City' },
                  { key: 'category' as SortField, label: 'Category' },
                  { key: 'status' as SortField, label: 'Status' },
                  { key: 'priority_score' as SortField, label: 'Priority' },
                  { key: 'updated_at' as SortField, label: 'Updated' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    <button
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {label}
                      <ArrowUpDown
                        className={`h-3.5 w-3.5 ${
                          sortField === key ? 'text-[#D4AF37]' : 'text-gray-600'
                        }`}
                      />
                    </button>
                  </th>
                ))}
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#D4AF37]" />
                    <p className="mt-2 text-sm text-gray-500">Loading venues...</p>
                  </td>
                </tr>
              ) : filteredVenues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      {hasActiveFilters || searchQuery
                        ? 'No venues match your filters'
                        : 'No venues yet'}
                    </p>
                    {(hasActiveFilters || searchQuery) && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-sm text-[#D4AF37] hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredVenues.map((venue) => (
                  <tr
                    key={venue.id}
                    className="group cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() =>
                      router.push(`/${locale}/admin/venues/${venue.id}/edit`)
                    }
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(venue.id)}
                        onChange={() => toggleSelect(venue.id)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#D4AF37] focus:ring-[#D4AF37]/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                          {venue.name}
                        </span>
                        {venue.is_sponsored && (
                          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
                            Sponsored
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600">/{venue.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {CITY_LABELS[venue.city as keyof typeof CITY_LABELS] || venue.city}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {CATEGORY_LABELS[venue.category as keyof typeof CATEGORY_LABELS] || venue.category}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={venue.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-800">
                          <div
                            className="h-full rounded-full bg-[#D4AF37]"
                            style={{ width: `${venue.priority_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{venue.priority_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(venue.updated_at)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === venue.id ? null : venue.id)
                          }
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {activeMenu === venue.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                              <button
                                onClick={() => {
                                  router.push(`/${locale}/admin/venues/${venue.id}/edit`);
                                  setActiveMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(venue)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                {venue.status === 'published' ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5" />
                                    Publish
                                  </>
                                )}
                              </button>
                              <div className="my-1 border-t border-gray-700" />
                              <button
                                onClick={() => handleDeleteVenue(venue.id, venue.name)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * perPage + 1} to{' '}
              {Math.min(currentPage * perPage, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#D4AF37] text-gray-950'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = {
    published: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
    },
    draft: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
    },
    archived: {
      bg: 'bg-gray-500/10 border-gray-500/20',
      text: 'text-gray-400',
      dot: 'bg-gray-400',
    },
  }[status] || { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-400' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
    </span>
  );
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function generateMockVenues(): Venue[] {
  const venues: Venue[] = [
    { id: 'v1', name: 'Sky Bar Casablanca', slug: 'sky-bar-casablanca', city: 'casablanca', category: 'rooftop', status: 'published', priority_score: 95, is_sponsored: true, updated_at: new Date(Date.now() - 2 * 3600000).toISOString(), created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'v2', name: 'Pacha Marrakech', slug: 'pacha-marrakech', city: 'marrakech', category: 'nightclub', status: 'published', priority_score: 92, is_sponsored: true, updated_at: new Date(Date.now() - 5 * 3600000).toISOString(), created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
    { id: 'v3', name: 'Le Comptoir Darna', slug: 'le-comptoir-darna', city: 'marrakech', category: 'restaurant_bar', status: 'published', priority_score: 88, is_sponsored: false, updated_at: new Date(Date.now() - 12 * 3600000).toISOString(), created_at: new Date(Date.now() - 45 * 86400000).toISOString() },
    { id: 'v4', name: 'Theatro Marrakech', slug: 'theatro-marrakech', city: 'marrakech', category: 'nightclub', status: 'published', priority_score: 90, is_sponsored: false, updated_at: new Date(Date.now() - 24 * 3600000).toISOString(), created_at: new Date(Date.now() - 90 * 86400000).toISOString() },
    { id: 'v5', name: 'So Lounge', slug: 'so-lounge', city: 'marrakech', category: 'lounge', status: 'draft', priority_score: 75, is_sponsored: false, updated_at: new Date(Date.now() - 36 * 3600000).toISOString(), created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: 'v6', name: 'Bazaar Bar', slug: 'bazaar-bar', city: 'tangier', category: 'bar', status: 'published', priority_score: 70, is_sponsored: false, updated_at: new Date(Date.now() - 48 * 3600000).toISOString(), created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
    { id: 'v7', name: 'Nikki Beach Marrakech', slug: 'nikki-beach-marrakech', city: 'marrakech', category: 'beach_club', status: 'published', priority_score: 85, is_sponsored: true, updated_at: new Date(Date.now() - 72 * 3600000).toISOString(), created_at: new Date(Date.now() - 120 * 86400000).toISOString() },
    { id: 'v8', name: 'Ruby Lounge Rabat', slug: 'ruby-lounge-rabat', city: 'rabat', category: 'lounge', status: 'draft', priority_score: 40, is_sponsored: false, updated_at: new Date(Date.now() - 96 * 3600000).toISOString(), created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'v9', name: 'Le Cabestan', slug: 'le-cabestan', city: 'casablanca', category: 'restaurant_bar', status: 'published', priority_score: 82, is_sponsored: false, updated_at: new Date(Date.now() - 120 * 3600000).toISOString(), created_at: new Date(Date.now() - 180 * 86400000).toISOString() },
    { id: 'v10', name: 'Iris Rooftop', slug: 'iris-rooftop', city: 'casablanca', category: 'rooftop', status: 'archived', priority_score: 60, is_sponsored: false, updated_at: new Date(Date.now() - 200 * 3600000).toISOString(), created_at: new Date(Date.now() - 200 * 86400000).toISOString() },
  ];
  return venues;
}

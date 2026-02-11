'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  GripVertical,
  FolderOpen,
  MapPin,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import {
  CITIES,
  CITY_LABELS,
  generateSlug,
  type CollectionFormData,
} from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  venue_ids: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface VenueMinimal {
  id: string;
  name: string;
  city: string;
  category: string;
  status: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

// ──────────────────────────────────────────────
// Collections Page
// ──────────────────────────────────────────────

export default function CollectionsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [allVenues, setAllVenues] = useState<VenueMinimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formVenueIds, setFormVenueIds] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Venue search inside form
  const [venueSearchQuery, setVenueSearchQuery] = useState('');

  // Expanded collection groups
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

  // ── Toast auto-dismiss ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [collectionsRes, venuesRes] = await Promise.allSettled([
        fetch('/api/admin/collections'),
        fetch('/api/admin/venues?per_page=200'),
      ]);

      if (collectionsRes.status === 'fulfilled' && collectionsRes.value.ok) {
        const data = await collectionsRes.value.json();
        setCollections(data.collections || []);
      } else {
        setCollections(generateMockCollections());
      }

      if (venuesRes.status === 'fulfilled' && venuesRes.value.ok) {
        const data = await venuesRes.value.json();
        setAllVenues(data.venues || []);
      } else {
        setAllVenues(generateMockVenueList());
      }
    } catch {
      setCollections(generateMockCollections());
      setAllVenues(generateMockVenueList());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Group collections by city ──
  const collectionsByCity = useMemo(() => {
    const grouped: Record<string, Collection[]> = {};
    collections.forEach((col) => {
      if (!grouped[col.city]) grouped[col.city] = [];
      grouped[col.city].push(col);
    });
    // Sort collections within each city by sort_order
    Object.keys(grouped).forEach((city) => {
      grouped[city].sort((a, b) => a.sort_order - b.sort_order);
    });
    return grouped;
  }, [collections]);

  // ── Initialize all cities as expanded ──
  useEffect(() => {
    setExpandedCities(new Set(Object.keys(collectionsByCity)));
  }, [collectionsByCity]);

  // ── Auto-generate slug ──
  useEffect(() => {
    if (formName && !editingId) {
      setFormSlug(generateSlug(formName));
    }
  }, [formName, editingId]);

  // ── Filtered venue list for the search in collection form ──
  const filteredVenues = useMemo(() => {
    let result = allVenues;

    // Filter by the same city as the collection
    if (formCity) {
      result = result.filter((v) => v.city === formCity);
    }

    if (venueSearchQuery) {
      const q = venueSearchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allVenues, formCity, venueSearchQuery]);

  // ── Form handlers ──
  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormCity('');
    setFormVenueIds([]);
    setFormIsActive(true);
    setEditingId(null);
    setShowForm(false);
    setVenueSearchQuery('');
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (collection: Collection) => {
    setFormName(collection.name);
    setFormSlug(collection.slug);
    setFormDescription(collection.description);
    setFormCity(collection.city);
    setFormVenueIds(collection.venue_ids);
    setFormIsActive(collection.is_active);
    setEditingId(collection.id);
    setShowForm(true);
    setVenueSearchQuery('');
  };

  const toggleVenueInCollection = (venueId: string) => {
    setFormVenueIds((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  const removeVenueFromCollection = (venueId: string) => {
    setFormVenueIds((prev) => prev.filter((id) => id !== venueId));
  };

  const moveVenueInList = (index: number, direction: 'up' | 'down') => {
    setFormVenueIds((prev) => {
      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!formName.trim() || !formCity) {
      setToast({ type: 'error', message: 'Name and city are required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const body: Partial<CollectionFormData> & { is_active?: boolean } = {
        name: formName,
        slug: formSlug || generateSlug(formName),
        description: formDescription,
        city: formCity as CollectionFormData['city'],
        venue_ids: formVenueIds,
        is_active: formIsActive,
      };

      const url = editingId
        ? `/api/admin/collections?id=${editingId}`
        : '/api/admin/collections';

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setToast({
          type: 'success',
          message: editingId ? 'Collection updated' : 'Collection created',
        });
        resetForm();
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ type: 'error', message: data.error || 'Failed to save' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setToast({ type: 'success', message: `"${name}" deleted` });
        fetchData();
      } else {
        setToast({ type: 'error', message: 'Failed to delete' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error' });
    }
  };

  // ── Toggle city group ──
  const toggleCityGroup = (city: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) {
        next.delete(city);
      } else {
        next.add(city);
      }
      return next;
    });
  };

  // ── Get venue name by ID ──
  const getVenueName = (id: string): string => {
    const venue = allVenues.find((v) => v.id === id);
    return venue?.name || id;
  };

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="text-sm text-gray-400">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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
          <h1 className="text-2xl font-bold text-white">Collections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize venues into curated collections by city
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-[#E5C349] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </button>
      </div>

      {/* Create / Edit Form Panel */}
      {showForm && (
        <div className="rounded-xl border border-[#D4AF37]/20 bg-gray-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Collection' : 'Create New Collection'}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Collection Name <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Best Rooftops in Casablanca"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Slug
              </label>
              <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800">
                <span className="px-3 text-sm text-gray-500">/collections/</span>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                City <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="">Select a city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {CITY_LABELS[c]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Describe this collection..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] resize-none"
              />
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-6 w-11 rounded-full transition-colors ${
                    formIsActive ? 'bg-[#D4AF37]' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                      formIsActive ? 'translate-x-5.5 ml-[2px]' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-300">Active</span>
            </label>

            {/* Venue Selector */}
            <div className="pt-2">
              <label className="mb-3 block text-sm font-semibold text-white">
                Venues in this Collection ({formVenueIds.length})
              </label>

              {/* Selected venues (reorderable) */}
              {formVenueIds.length > 0 && (
                <div className="mb-4 space-y-1 rounded-lg border border-gray-700 bg-gray-800/50 p-2">
                  {formVenueIds.map((venueId, idx) => (
                    <div
                      key={venueId}
                      className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveVenueInList(idx, 'up')}
                          disabled={idx === 0}
                          className="text-gray-500 hover:text-white disabled:opacity-20"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveVenueInList(idx, 'down')}
                          disabled={idx === formVenueIds.length - 1}
                          className="text-gray-500 hover:text-white disabled:opacity-20"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <GripVertical className="h-4 w-4 text-gray-600" />
                      <span className="mr-2 text-xs font-medium text-gray-500">
                        #{idx + 1}
                      </span>
                      <span className="flex-1 text-sm text-white">
                        {getVenueName(venueId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVenueFromCollection(venueId)}
                        className="rounded p-1 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search & add venues */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={venueSearchQuery}
                  onChange={(e) => setVenueSearchQuery(e.target.value)}
                  placeholder={
                    formCity
                      ? `Search venues in ${CITY_LABELS[formCity as keyof typeof CITY_LABELS]}...`
                      : 'Select a city first to search venues...'
                  }
                  disabled={!formCity}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] disabled:opacity-50"
                />
              </div>

              {/* Available venues */}
              {formCity && (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/30 p-2">
                  {filteredVenues.length === 0 ? (
                    <p className="px-3 py-4 text-center text-sm text-gray-500">
                      {venueSearchQuery ? 'No matching venues' : 'No venues in this city'}
                    </p>
                  ) : (
                    filteredVenues.map((venue) => {
                      const isAdded = formVenueIds.includes(venue.id);
                      return (
                        <button
                          key={venue.id}
                          type="button"
                          onClick={() => toggleVenueInCollection(venue.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isAdded
                              ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              isAdded
                                ? 'border-[#D4AF37] bg-[#D4AF37]'
                                : 'border-gray-600'
                            }`}
                          >
                            {isAdded && (
                              <CheckCircle className="h-3 w-3 text-gray-950" />
                            )}
                          </div>
                          <span className="flex-1">{venue.name}</span>
                          <span className="text-xs text-gray-500">{venue.category}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={resetForm}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formName.trim() || !formCity}
                className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-[#E5C349] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingId ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections List (grouped by city) */}
      {collections.length === 0 && !showForm ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-700" />
          <h3 className="mt-4 text-lg font-medium text-white">No collections yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first collection to organize venues into curated groups.
          </p>
          <button
            onClick={openCreateForm}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-[#E5C349] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create First Collection
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(collectionsByCity)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([city, cityCollections]) => (
              <div
                key={city}
                className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
              >
                {/* City Header */}
                <button
                  onClick={() => toggleCityGroup(city)}
                  className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4.5 w-4.5 text-[#D4AF37]" />
                    <h2 className="text-base font-semibold text-white">
                      {CITY_LABELS[city as keyof typeof CITY_LABELS] || city}
                    </h2>
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                      {cityCollections.length} collection{cityCollections.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {expandedCities.has(city) ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {/* Collection Items */}
                {expandedCities.has(city) && (
                  <div className="divide-y divide-gray-800 border-t border-gray-800">
                    {cityCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">
                              {collection.name}
                            </h3>
                            {!collection.is_active && (
                              <span className="rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">
                            /{collection.slug} &middot; {collection.venue_ids.length} venue{collection.venue_ids.length !== 1 ? 's' : ''}
                          </p>
                          {collection.description && (
                            <p className="mt-1 truncate text-sm text-gray-400">
                              {collection.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditForm(collection)}
                            className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(collection.id, collection.name)}
                            className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Mock data
// ──────────────────────────────────────────────

function generateMockCollections(): Collection[] {
  return [
    {
      id: 'col-1',
      name: 'Best Rooftops in Casablanca',
      slug: 'best-rooftops-casablanca',
      description: 'Discover the most stunning rooftop bars and lounges in Casablanca with panoramic views.',
      city: 'casablanca',
      venue_ids: ['v1', 'v9'],
      is_active: true,
      sort_order: 0,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'col-2',
      name: 'Top Nightclubs Casablanca',
      slug: 'top-nightclubs-casablanca',
      description: 'The hottest nightclubs in Casablanca for an unforgettable night out.',
      city: 'casablanca',
      venue_ids: ['v1'],
      is_active: true,
      sort_order: 1,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'col-3',
      name: 'Marrakech Nightlife Essentials',
      slug: 'marrakech-nightlife-essentials',
      description: 'Must-visit nightlife spots in the Red City.',
      city: 'marrakech',
      venue_ids: ['v2', 'v3', 'v4'],
      is_active: true,
      sort_order: 0,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'col-4',
      name: 'Beach Clubs & Pool Parties',
      slug: 'beach-clubs-pool-parties-marrakech',
      description: 'The best beach clubs and pool party venues around Marrakech.',
      city: 'marrakech',
      venue_ids: ['v7'],
      is_active: true,
      sort_order: 1,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'col-5',
      name: 'Tangier After Dark',
      slug: 'tangier-after-dark',
      description: 'Explore the nightlife scene in Morocco\'s northern jewel.',
      city: 'tangier',
      venue_ids: ['v6'],
      is_active: false,
      sort_order: 0,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ];
}

function generateMockVenueList(): VenueMinimal[] {
  return [
    { id: 'v1', name: 'Sky Bar Casablanca', city: 'casablanca', category: 'rooftop', status: 'published' },
    { id: 'v2', name: 'Pacha Marrakech', city: 'marrakech', category: 'nightclub', status: 'published' },
    { id: 'v3', name: 'Le Comptoir Darna', city: 'marrakech', category: 'restaurant_bar', status: 'published' },
    { id: 'v4', name: 'Theatro Marrakech', city: 'marrakech', category: 'nightclub', status: 'published' },
    { id: 'v5', name: 'So Lounge', city: 'marrakech', category: 'lounge', status: 'draft' },
    { id: 'v6', name: 'Bazaar Bar', city: 'tangier', category: 'bar', status: 'published' },
    { id: 'v7', name: 'Nikki Beach Marrakech', city: 'marrakech', category: 'beach_club', status: 'published' },
    { id: 'v8', name: 'Ruby Lounge Rabat', city: 'rabat', category: 'lounge', status: 'draft' },
    { id: 'v9', name: 'Le Cabestan', city: 'casablanca', category: 'restaurant_bar', status: 'published' },
    { id: 'v10', name: 'Iris Rooftop', city: 'casablanca', category: 'rooftop', status: 'archived' },
  ];
}

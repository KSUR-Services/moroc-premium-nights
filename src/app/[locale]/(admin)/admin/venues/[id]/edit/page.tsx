'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import VenueForm from '@/components/admin/VenueForm';
import type { VenueFormData } from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type VenueData = Partial<VenueFormData> & { id: string };

// ──────────────────────────────────────────────
// Edit Venue Page
// ──────────────────────────────────────────────

export default function EditVenuePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'fr';
  const venueId = params?.id as string;

  const [venue, setVenue] = useState<VenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch venue data ──
  useEffect(() => {
    const fetchVenue = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/venues/${venueId}`);

        if (res.ok) {
          const data = await res.json();
          setVenue(data.venue || data);
        } else if (res.status === 404) {
          setError('Venue not found');
        } else {
          // Fallback to mock data during development
          setVenue(generateMockVenue(venueId));
        }
      } catch {
        // Use mock data if API is not available
        setVenue(generateMockVenue(venueId));
      } finally {
        setIsLoading(false);
      }
    };

    if (venueId) {
      fetchVenue();
    }
  }, [venueId]);

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!venue) return;
    if (!confirm(`Delete "${venue.name}"? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push(`/${locale}/admin/venues`);
      } else {
        alert('Failed to delete venue');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="text-sm text-gray-400">Loading venue data...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !venue) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {error || 'Venue not found'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              The venue you are looking for does not exist or has been removed.
            </p>
          </div>
          <Link
            href={`/${locale}/admin/venues`}
            className="mt-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-[#E5C349] transition-colors"
          >
            Back to Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back navigation + Delete */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/${locale}/admin/venues`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400
            hover:bg-red-500/20 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete Venue
        </button>
      </div>

      {/* Venue Form */}
      <VenueForm mode="edit" initialData={venue} />
    </div>
  );
}

// ──────────────────────────────────────────────
// Mock data for development
// ──────────────────────────────────────────────

function generateMockVenue(id: string): VenueData {
  return {
    id,
    name: 'Sky Bar Casablanca',
    slug: 'sky-bar-casablanca',
    city: 'casablanca',
    category: 'rooftop',
    address: '123 Boulevard de la Corniche, Ain Diab',
    neighborhood: 'Ain Diab',
    latitude: 33.5892,
    longitude: -7.6661,
    whatsapp: '+212 600 123 456',
    phone: '+212 522 123 456',
    instagram: 'skybarcasa',
    website: 'https://skybar-casablanca.com',
    price_range: '$$$',
    dress_code: 'Smart Casual',
    music_style: 'House, Deep House, Afrobeats',
    age_policy: '21+',
    alcohol_policy: 'Full bar - Licensed',
    attributes: {
      capacity: '300',
      valet_parking: 'true',
      reservation_required: 'true',
    },
    tag_ids: ['tag-1', 'tag-3', 'tag-4', 'tag-7'],
    contents: [
      {
        locale: 'fr',
        description:
          'Perche au sommet de Casablanca, Sky Bar offre une experience unique avec une vue panoramique sur l\'ocean Atlantique. Ambiance sophistiquee, cocktails signatures et musique selectionnee par les meilleurs DJs de la scene marocaine.',
        seo_title: 'Sky Bar Casablanca - Rooftop Bar Premium',
        seo_description:
          'Decouvrez Sky Bar, le rooftop bar le plus exclusif de Casablanca avec vue panoramique sur l\'ocean.',
        seo_keywords: ['rooftop casablanca', 'bar casablanca', 'nightlife casablanca', 'vue ocean'],
      },
      {
        locale: 'en',
        description:
          'Perched atop Casablanca, Sky Bar offers a unique experience with panoramic views of the Atlantic Ocean. Sophisticated ambiance, signature cocktails, and music curated by the best DJs on the Moroccan scene.',
        seo_title: 'Sky Bar Casablanca - Premium Rooftop Bar',
        seo_description:
          'Discover Sky Bar, Casablanca\'s most exclusive rooftop bar with panoramic ocean views.',
        seo_keywords: ['rooftop casablanca', 'bar casablanca', 'nightlife casablanca', 'ocean view'],
      },
    ],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
        alt: 'Sky Bar rooftop view at sunset',
        is_cover: true,
        sort_order: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        alt: 'Bar interior with ambient lighting',
        is_cover: false,
        sort_order: 1,
      },
    ],
    status: 'published',
    priority_score: 95,
    is_sponsored: true,
    internal_notes: 'Premium partner venue. Contact: Ahmed - +212 600 111 222',
  };
}

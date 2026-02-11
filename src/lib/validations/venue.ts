import { z } from 'zod';

// ──────────────────────────────────────────────
// Enum values used across the application
// ──────────────────────────────────────────────

export const CITIES = [
  'casablanca',
  'marrakech',
  'rabat',
  'tangier',
  'agadir',
  'fes',
  'essaouira',
  'meknes',
] as const;

export const CATEGORIES = [
  'nightclub',
  'rooftop',
  'lounge',
  'beach_club',
  'bar',
  'restaurant_bar',
  'shisha_lounge',
  'live_music',
  'pool_party',
] as const;

export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export const VENUE_STATUSES = ['draft', 'published', 'archived'] as const;

export const LOCALES = ['fr', 'en'] as const;

// ──────────────────────────────────────────────
// Venue content (per locale)
// ──────────────────────────────────────────────

export const venueContentSchema = z.object({
  locale: z.enum(LOCALES),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  seo_title: z.string().max(70, 'SEO title must not exceed 70 characters').optional().default(''),
  seo_description: z
    .string()
    .max(160, 'SEO description must not exceed 160 characters')
    .optional()
    .default(''),
  seo_keywords: z.array(z.string().max(50)).max(20, 'Maximum 20 keywords').optional().default([]),
});

export type VenueContent = z.infer<typeof venueContentSchema>;

// ──────────────────────────────────────────────
// Venue photo
// ──────────────────────────────────────────────

export const venuePhotoSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url('Must be a valid URL'),
  alt: z.string().max(200).optional().default(''),
  is_cover: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

export type VenuePhoto = z.infer<typeof venuePhotoSchema>;

// ──────────────────────────────────────────────
// Full venue schema
// ──────────────────────────────────────────────

export const venueSchema = z.object({
  // Basic info
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must not exceed 120 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)'),
  city: z.enum(CITIES, { error: 'Please select a valid city' }),
  category: z.enum(CATEGORIES, { error: 'Please select a valid category' }),

  // Location
  address: z.string().min(5, 'Address is required').max(300),
  neighborhood: z.string().max(100).optional().default(''),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),

  // Contact
  whatsapp: z
    .string()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Invalid WhatsApp number')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),

  // Details
  price_range: z.enum(PRICE_RANGES).optional().nullable(),
  dress_code: z.string().max(200).optional().default(''),
  music_style: z.string().max(300).optional().default(''),
  age_policy: z.string().max(200).optional().default(''),
  alcohol_policy: z.string().max(200).optional().default(''),

  // Attributes (dynamic JSONB)
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().default({}),

  // Tags
  tag_ids: z.array(z.string().uuid()).optional().default([]),

  // Content per locale
  contents: z
    .array(venueContentSchema)
    .min(1, 'At least one locale content is required')
    .max(2),

  // Photos
  photos: z.array(venuePhotoSchema).optional().default([]),

  // Settings
  status: z.enum(VENUE_STATUSES).default('draft'),
  priority_score: z.number().int().min(0).max(100).default(0),
  is_sponsored: z.boolean().default(false),
  internal_notes: z.string().max(2000).optional().default(''),
});

export type VenueFormData = z.infer<typeof venueSchema>;

// ──────────────────────────────────────────────
// Venue filter schema (for list page queries)
// ──────────────────────────────────────────────

export const venueFilterSchema = z.object({
  search: z.string().optional().default(''),
  city: z.enum(CITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(VENUE_STATUSES).optional(),
  sort_by: z
    .enum(['name', 'city', 'category', 'status', 'priority_score', 'updated_at', 'created_at'])
    .optional()
    .default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().int().min(1).optional().default(1),
  per_page: z.number().int().min(1).max(100).optional().default(25),
});

export type VenueFilter = z.infer<typeof venueFilterSchema>;

// ──────────────────────────────────────────────
// Collection schemas
// ──────────────────────────────────────────────

export const collectionSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must not exceed 120 characters'),
  slug: z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
  description: z.string().max(1000).optional().default(''),
  city: z.enum(CITIES, { error: 'Please select a valid city' }),
  venue_ids: z.array(z.string().uuid()).optional().default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;

export const collectionFilterSchema = z.object({
  city: z.enum(CITIES).optional(),
  search: z.string().optional().default(''),
  is_active: z.boolean().optional(),
});

export type CollectionFilter = z.infer<typeof collectionFilterSchema>;

// ──────────────────────────────────────────────
// Helper: Generate slug from name
// ──────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse hyphens
    .replace(/^-|-$/g, '');         // Trim hyphens
}

// ──────────────────────────────────────────────
// Helper: City display names
// ──────────────────────────────────────────────

export const CITY_LABELS: Record<typeof CITIES[number], string> = {
  casablanca: 'Casablanca',
  marrakech: 'Marrakech',
  rabat: 'Rabat',
  tangier: 'Tangier',
  agadir: 'Agadir',
  fes: 'Fes',
  essaouira: 'Essaouira',
  meknes: 'Meknes',
};

export const CATEGORY_LABELS: Record<typeof CATEGORIES[number], string> = {
  nightclub: 'Nightclub',
  rooftop: 'Rooftop',
  lounge: 'Lounge',
  beach_club: 'Beach Club',
  bar: 'Bar',
  restaurant_bar: 'Restaurant & Bar',
  shisha_lounge: 'Shisha Lounge',
  live_music: 'Live Music',
  pool_party: 'Pool Party',
};

export const STATUS_LABELS: Record<typeof VENUE_STATUSES[number], string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

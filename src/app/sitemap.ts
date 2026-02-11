import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://morocnights.com';
const LOCALES = ['fr', 'en'] as const;

interface VenueRow {
  slug: string;
  updated_at: string;
  city: { slug: string };
  category: { slug: string };
}

interface CityRow {
  slug: string;
  updated_at: string;
}

interface CategoryRow {
  slug: string;
  updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let venues: VenueRow[] = [];
  let cities: CityRow[] = [];
  let categories: CategoryRow[] = [];

  // Only fetch from Supabase if we have valid credentials
  if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const [venuesResult, citiesResult, categoriesResult] = await Promise.all([
        supabase
          .from('venues')
          .select('slug, updated_at, city:cities(slug), category:categories(slug)')
          .eq('status', 'published')
          .order('updated_at', { ascending: false }),
        supabase
          .from('cities')
          .select('slug, updated_at')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('categories')
          .select('slug, updated_at')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

      venues = (venuesResult.data as unknown as VenueRow[]) || [];
      cities = (citiesResult.data as CityRow[]) || [];
      categories = (categoriesResult.data as CategoryRow[]) || [];
    } catch {
      // Sitemap generation will proceed with empty data
    }
  }

  const entries: MetadataRoute.Sitemap = [];

  // Home pages for each locale
  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  }

  // City pages: /{locale}/{citySlug}
  for (const city of cities) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${city.slug}`,
        lastModified: new Date(city.updated_at),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // Category pages within cities: /{locale}/{citySlug}/{categorySlug}
  for (const city of cities) {
    for (const category of categories) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/${city.slug}/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  }

  // Venue detail pages: /{locale}/{citySlug}/{categorySlug}/{venueSlug}
  for (const venue of venues) {
    const citySlug = venue.city?.slug;
    const categorySlug = venue.category?.slug;

    if (!citySlug || !categorySlug) continue;

    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${citySlug}/${categorySlug}/${venue.slug}`,
        lastModified: new Date(venue.updated_at),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}

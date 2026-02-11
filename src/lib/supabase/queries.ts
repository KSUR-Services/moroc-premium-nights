// =============================================================================
// Core data-fetching functions for the Morocco Premium Nightlife Directory
// =============================================================================
// Every function uses the **server** Supabase client so it can be called from
// Server Components, Route Handlers and Server Actions without prop-drilling.
//
// Naming conventions:
//   get*   — single SELECT (read)
//   search* / nearby* — calls a Postgres RPC function
//
// Error handling: on any Supabase error the function throws a descriptive
// Error so the calling page can render an error boundary or 404 page.
// =============================================================================

import { createServerSupabaseClient } from './server';
import type {
  Category,
  City,
  Collection,
  NearbyVenue,
  Photo,
  SearchVenueResult,
  Tag,
  Venue,
  VenueCard,
  VenueContent,
  VenueWithDetails,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default number of venues per page in list views. */
const DEFAULT_PAGE_SIZE = 12;

/**
 * Throw a consistent error from a Supabase response.
 * Keeps the call sites clean and avoids duplicating `if (error)` blocks.
 */
function throwOnError<T>(
  result: { data: T | null; error: { message: string; code?: string } | null },
  context: string,
): T {
  if (result.error) {
    throw new Error(`[${context}] ${result.error.message}`);
  }
  if (result.data === null) {
    throw new Error(`[${context}] Unexpected null data`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

/** Fetch every city, ordered alphabetically. */
export async function getCities(): Promise<City[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true });

  return throwOnError(result, 'getCities');
}

/** Fetch a single city by its URL slug. Returns `null` when not found. */
export async function getCity(slug: string): Promise<City | null> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (result.error) {
    throw new Error(`[getCity] ${result.error.message}`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/** Fetch all categories ordered by their display priority. */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from('categories')
    .select('*')
    .order('priority', { ascending: true });

  return throwOnError(result, 'getCategories');
}

// ---------------------------------------------------------------------------
// Venue list (with filtering & pagination)
// ---------------------------------------------------------------------------

export type VenueListOptions = {
  /** Filter by category slug. */
  category?: string;
  /** Filter by one or more tag slugs. */
  tags?: string[];
  /** 1-based page number (default 1). */
  page?: number;
  /** Items per page (default 12). */
  limit?: number;
};

/**
 * Fetch published venues for a city with optional filtering and pagination.
 *
 * Results are sorted so that sponsored venues appear first, then by
 * `priority_score` descending.
 *
 * Returns the venue rows together with a `count` so the caller can render
 * pagination controls.
 */
export async function getVenuesByCity(
  citySlug: string,
  options: VenueListOptions = {},
): Promise<{ venues: Venue[]; count: number }> {
  const { category, tags, page = 1, limit = DEFAULT_PAGE_SIZE } = options;

  const supabase = await createServerSupabaseClient();

  // Resolve the city id from the slug first.
  const city = await getCity(citySlug);
  if (!city) {
    return { venues: [], count: 0 };
  }

  // Start building the query.
  let query = supabase
    .from('venues')
    .select('*', { count: 'exact' })
    .eq('city_id', city.id)
    .eq('status', 'published');

  // Category filter — resolve slug to id via a sub-query.
  if (category) {
    const catResult = await supabase
      .from('categories')
      .select('*')
      .eq('slug', category)
      .maybeSingle();

    if (catResult.data) {
      query = query.eq('category_id', catResult.data.id);
    }
  }

  // Tag filter — find venue ids that own ALL requested tags, then apply an
  // `in` filter. This keeps the main query simple and avoids deeply nested
  // joins that Supabase REST cannot express easily.
  if (tags && tags.length > 0) {
    const tagResult = await supabase
      .from('tags')
      .select('*')
      .in('slug', tags);

    const tagIds = (tagResult.data ?? []).map((t) => t.id);

    if (tagIds.length > 0) {
      // For each requested tag the venue must have a row in venues_tags.
      // We retrieve venue_ids that match ALL tags using a simple approach:
      // fetch all pairings and count per venue.
      const vtResult = await supabase
        .from('venues_tags')
        .select('*')
        .in('tag_id', tagIds);

      const venueTagCounts = new Map<number, number>();
      for (const row of vtResult.data ?? []) {
        venueTagCounts.set(
          row.venue_id,
          (venueTagCounts.get(row.venue_id) ?? 0) + 1,
        );
      }

      const matchingVenueIds = Array.from(venueTagCounts.entries())
        .filter(([, count]) => count >= tagIds.length)
        .map(([venueId]) => venueId);

      if (matchingVenueIds.length === 0) {
        return { venues: [], count: 0 };
      }

      query = query.in('id', matchingVenueIds);
    }
  }

  // Ordering: sponsored first, then priority descending.
  query = query
    .order('is_sponsored', { ascending: false })
    .order('priority_score', { ascending: false });

  // Pagination.
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const result = await query;

  if (result.error) {
    throw new Error(`[getVenuesByCity] ${result.error.message}`);
  }

  return {
    venues: result.data ?? [],
    count: result.count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Venue detail (full join)
// ---------------------------------------------------------------------------

/**
 * Fetch a single published venue with all related data (contents, photos,
 * tags, city, category).
 *
 * The caller provides the three slug segments that form the canonical URL:
 *   /:citySlug/:categorySlug/:venueSlug
 *
 * The optional `language` parameter determines which content row is
 * prioritised when building the response.
 */
export async function getVenueDetail(
  citySlug: string,
  categorySlug: string,
  venueSlug: string,
  language: 'fr' | 'en' = 'fr',
): Promise<VenueWithDetails | null> {
  const supabase = await createServerSupabaseClient();

  // Resolve city.
  const city = await getCity(citySlug);
  if (!city) return null;

  // Resolve category.
  const catResult = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .maybeSingle();
  if (catResult.error) throw new Error(`[getVenueDetail] ${catResult.error.message}`);
  const category = catResult.data;
  if (!category) return null;

  // Fetch the venue itself.
  const venueResult = await supabase
    .from('venues')
    .select('*')
    .eq('slug', venueSlug)
    .eq('city_id', city.id)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .maybeSingle();

  if (venueResult.error) throw new Error(`[getVenueDetail] ${venueResult.error.message}`);
  const venue = venueResult.data;
  if (!venue) return null;

  // Fetch related rows in parallel.
  const [contentsResult, photosResult, venueTagsResult] = await Promise.all([
    supabase
      .from('contents')
      .select('*')
      .eq('venue_id', venue.id),
    supabase
      .from('photos')
      .select('*')
      .eq('venue_id', venue.id)
      .order('order', { ascending: true }),
    supabase
      .from('venues_tags')
      .select('*')
      .eq('venue_id', venue.id),
  ]);

  const contents: VenueContent[] = contentsResult.data ?? [];
  const photos: Photo[] = photosResult.data ?? [];

  // Resolve tags from the junction table.
  const tagIds = (venueTagsResult.data ?? []).map((vt) => vt.tag_id);
  let tags: Tag[] = [];
  if (tagIds.length > 0) {
    const tagsResult = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);
    tags = tagsResult.data ?? [];
  }

  // Sort contents so that the requested language comes first.
  contents.sort((a, b) => {
    if (a.language === language && b.language !== language) return -1;
    if (a.language !== language && b.language === language) return 1;
    return 0;
  });

  return {
    ...venue,
    contents,
    photos,
    tags,
    city,
    category,
  };
}

// ---------------------------------------------------------------------------
// Venue cards (optimised lightweight query for list/grid views)
// ---------------------------------------------------------------------------

export type VenueCardsOptions = {
  /** Filter by category slug. */
  category?: string;
  /** Filter by tag slugs (AND logic). */
  tags?: string[];
  /** 1-based page number. */
  page?: number;
  /** Items per page. */
  limit?: number;
};

/**
 * Build `VenueCard` objects ready for the UI.
 *
 * This is the recommended function for rendering venue grids. It fetches only
 * the columns needed for the card component and resolves the cover photo,
 * description (in the requested language) and tag names in a minimal number
 * of round-trips.
 */
export async function getVenueCards(
  cityId: number,
  language: 'fr' | 'en' = 'fr',
  options: VenueCardsOptions = {},
): Promise<{ cards: VenueCard[]; count: number }> {
  const { category, tags, page = 1, limit = DEFAULT_PAGE_SIZE } = options;

  const supabase = await createServerSupabaseClient();

  // ---- Build the base venue query ------------------------------------------
  let query = supabase
    .from('venues')
    .select(
      '*',
      { count: 'exact' },
    )
    .eq('city_id', cityId)
    .eq('status', 'published');

  // Category filter.
  if (category) {
    const catResult = await supabase
      .from('categories')
      .select('*')
      .eq('slug', category)
      .maybeSingle();

    if (catResult.data) {
      query = query.eq('category_id', catResult.data.id);
    }
  }

  // Tag filter (AND logic, same approach as getVenuesByCity).
  if (tags && tags.length > 0) {
    const tagResult = await supabase.from('tags').select('*').in('slug', tags);
    const tagIds = (tagResult.data ?? []).map((t) => t.id);

    if (tagIds.length > 0) {
      const vtResult = await supabase
        .from('venues_tags')
        .select('*')
        .in('tag_id', tagIds);

      const counts = new Map<number, number>();
      for (const row of vtResult.data ?? []) {
        counts.set(row.venue_id, (counts.get(row.venue_id) ?? 0) + 1);
      }

      const matchingIds = Array.from(counts.entries())
        .filter(([, c]) => c >= tagIds.length)
        .map(([vid]) => vid);

      if (matchingIds.length === 0) {
        return { cards: [], count: 0 };
      }
      query = query.in('id', matchingIds);
    }
  }

  // Ordering & pagination.
  query = query
    .order('is_sponsored', { ascending: false })
    .order('priority_score', { ascending: false })
    .range((page - 1) * limit, (page - 1) * limit + limit - 1);

  const result = await query;
  if (result.error) throw new Error(`[getVenueCards] ${result.error.message}`);

  const venues = result.data ?? [];
  if (venues.length === 0) {
    return { cards: [], count: result.count ?? 0 };
  }

  const venueIds = venues.map((v) => v.id);
  const categoryIds = [...new Set(venues.map((v) => v.category_id))];

  // ---- Fetch related data in parallel --------------------------------------
  const [
    contentsResult,
    photosResult,
    venueTagsResult,
    categoriesResult,
    cityResult,
  ] = await Promise.all([
    supabase
      .from('contents')
      .select('*')
      .in('venue_id', venueIds),
    supabase
      .from('photos')
      .select('*')
      .in('venue_id', venueIds)
      .eq('is_cover', true),
    supabase
      .from('venues_tags')
      .select('*')
      .in('venue_id', venueIds),
    supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds),
    supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single(),
  ]);

  // Build look-up maps for O(1) access during card assembly.
  const contentsByVenue = new Map<number, Map<string, string>>();
  for (const c of contentsResult.data ?? []) {
    if (!contentsByVenue.has(c.venue_id)) {
      contentsByVenue.set(c.venue_id, new Map());
    }
    contentsByVenue.get(c.venue_id)!.set(c.language, c.description);
  }

  const coverByVenue = new Map<number, string>();
  for (const p of photosResult.data ?? []) {
    // Take the first cover photo per venue.
    if (!coverByVenue.has(p.venue_id)) {
      coverByVenue.set(p.venue_id, p.url);
    }
  }

  // Resolve tag names for the venues.
  const tagIdsByVenue = new Map<number, number[]>();
  for (const vt of venueTagsResult.data ?? []) {
    if (!tagIdsByVenue.has(vt.venue_id)) {
      tagIdsByVenue.set(vt.venue_id, []);
    }
    tagIdsByVenue.get(vt.venue_id)!.push(vt.tag_id);
  }

  const allTagIds = [...new Set(Array.from(tagIdsByVenue.values()).flat())];
  const tagNameById = new Map<number, string>();
  if (allTagIds.length > 0) {
    const tagsResult = await supabase
      .from('tags')
      .select('*')
      .in('id', allTagIds);
    for (const t of tagsResult.data ?? []) {
      tagNameById.set(t.id, t.name);
    }
  }

  const catSlugById = new Map<number, string>();
  for (const cat of categoriesResult.data ?? []) {
    catSlugById.set(cat.id, cat.slug);
  }

  const citySlug: string = cityResult.data?.slug ?? '';

  // ---- Assemble cards ------------------------------------------------------
  const cards: VenueCard[] = venues.map((v) => {
    const langMap = contentsByVenue.get(v.id);
    const description =
      langMap?.get(language) ?? langMap?.get(language === 'fr' ? 'en' : 'fr') ?? '';

    const venueTagIds = tagIdsByVenue.get(v.id) ?? [];
    const tagNames = venueTagIds
      .map((tid) => tagNameById.get(tid))
      .filter((n): n is string => n !== undefined);

    return {
      id: v.id,
      name: v.name,
      slug: v.slug,
      neighborhood: v.neighborhood,
      price_range: v.price_range as Venue['price_range'],
      is_sponsored: v.is_sponsored,
      priority_score: v.priority_score,
      cover_photo: coverByVenue.get(v.id) ?? null,
      description,
      category_slug: catSlugById.get(v.category_id) ?? '',
      city_slug: citySlug,
      tags: tagNames,
    };
  });

  return { cards, count: result.count ?? 0 };
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

/** Fetch all curated collections for a city. */
export async function getCollectionsByCity(
  citySlug: string,
): Promise<Collection[]> {
  const supabase = await createServerSupabaseClient();

  const city = await getCity(citySlug);
  if (!city) return [];

  const result = await supabase
    .from('collections')
    .select('*')
    .eq('city_id', city.id)
    .order('name', { ascending: true });

  return throwOnError(result, 'getCollectionsByCity');
}

// ---------------------------------------------------------------------------
// Full-text search (Postgres RPC)
// ---------------------------------------------------------------------------

/**
 * Search venues by a free-text query. Delegates to the `search_venues`
 * Postgres function which uses `ts_rank` over a GIN index.
 *
 * Optionally scoped to a single city.
 */
export async function searchVenues(
  query: string,
  cityId?: number,
): Promise<SearchVenueResult[]> {
  const supabase = await createServerSupabaseClient();

  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const args: { search_query: string; p_city_id?: number } = {
    search_query: trimmed,
  };
  if (cityId !== undefined) {
    args.p_city_id = cityId;
  }

  const result = await supabase.rpc('search_venues', args);

  if (result.error) {
    throw new Error(`[searchVenues] ${result.error.message}`);
  }

  return (result.data ?? []) as SearchVenueResult[];
}

// ---------------------------------------------------------------------------
// Nearby venues (Postgres RPC using PostGIS)
// ---------------------------------------------------------------------------

/**
 * Find venues near a geographic point. Delegates to the `nearby_venues`
 * Postgres function that uses `ST_DWithin` on the `latlng` column.
 *
 * @param lat  Latitude of the origin point.
 * @param lng  Longitude of the origin point.
 * @param radiusM  Search radius in metres (default handled by the DB function,
 *                 typically 2 000 m).
 */
export async function getNearbyVenues(
  lat: number,
  lng: number,
  radiusM?: number,
): Promise<NearbyVenue[]> {
  const supabase = await createServerSupabaseClient();

  const args: { p_lat: number; p_lng: number; p_radius_m?: number } = {
    p_lat: lat,
    p_lng: lng,
  };
  if (radiusM !== undefined) {
    args.p_radius_m = radiusM;
  }

  const result = await supabase.rpc('nearby_venues', args);

  if (result.error) {
    throw new Error(`[getNearbyVenues] ${result.error.message}`);
  }

  return (result.data ?? []) as NearbyVenue[];
}

// =============================================================================
// Aliases and wrappers for page compatibility
// =============================================================================

/** Alias for getCity — used by page components. */
export const getCityBySlug = getCity;

/** Get all categories (they are global, not per-city). */
export async function getCategoriesForCity(_citySlug: string): Promise<Category[]> {
  return getCategories();
}

/** Alias for getCollectionsByCity with optional unused options param. */
export async function getCollectionsForCity(
  citySlug: string,
  _options?: { limit?: number },
): Promise<Collection[]> {
  return getCollectionsByCity(citySlug);
}

/** Get a single category by its slug. */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (result.error) throw new Error(`[getCategoryBySlug] ${result.error.message}`);
  return result.data;
}

/** Get venues filtered by city and category. */
export async function getVenuesByCategory(
  citySlug: string,
  categorySlug: string,
  options: Record<string, any> = {},
): Promise<{ venues: Venue[]; count: number }> {
  return getVenuesByCity(citySlug, { category: categorySlug, ...options });
}

/** Get featured (top priority) venues across all cities. */
export async function getFeaturedVenues(
  options: { limit?: number } = {},
): Promise<Venue[]> {
  const supabase = await createServerSupabaseClient();
  const limit = options.limit ?? 12;
  const result = await supabase
    .from('venues')
    .select('*')
    .eq('status', 'published')
    .order('is_sponsored', { ascending: false })
    .order('priority_score', { ascending: false })
    .limit(limit);
  if (result.error) throw new Error(`[getFeaturedVenues] ${result.error.message}`);
  return result.data ?? [];
}

/** Get featured collections across all cities. */
export async function getFeaturedCollections(
  options: { limit?: number } = {},
): Promise<Collection[]> {
  const supabase = await createServerSupabaseClient();
  const limit = options.limit ?? 8;
  const result = await supabase
    .from('collections')
    .select('*')
    .limit(limit);
  if (result.error) throw new Error(`[getFeaturedCollections] ${result.error.message}`);
  return result.data ?? [];
}

// ---------------------------------------------------------------------------
// Venue detail individual query functions (used by venue detail page)
// ---------------------------------------------------------------------------

/** Extended venue type with joined city and category names. */
export type VenueWithJoins = Venue & {
  city_name: string;
  city_slug: string;
  category_name: string;
  category_slug: string;
  cover_image_url: string | null;
};

/** Fetch a single venue by slug with city/category info. */
export async function getVenueBySlug(slug: string): Promise<VenueWithJoins | null> {
  const supabase = await createServerSupabaseClient();
  const venueResult = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (venueResult.error) throw new Error(`[getVenueBySlug] ${venueResult.error.message}`);
  const venue = venueResult.data;
  if (!venue) return null;

  const [cityResult, categoryResult, coverResult] = await Promise.all([
    supabase.from('cities').select('*').eq('id', venue.city_id).single(),
    supabase.from('categories').select('*').eq('id', venue.category_id).single(),
    supabase.from('photos').select('*').eq('venue_id', venue.id).eq('is_cover', true).maybeSingle(),
  ]);

  return {
    ...venue,
    city_name: cityResult.data?.name ?? '',
    city_slug: cityResult.data?.slug ?? '',
    category_name: categoryResult.data?.name ?? '',
    category_slug: categoryResult.data?.slug ?? '',
    cover_image_url: coverResult.data?.url ?? null,
  };
}

/** Fetch venue content for a specific language. */
export async function getVenueContent(
  venueSlug: string,
  language: 'fr' | 'en',
): Promise<(VenueContent & { seo_title?: string; seo_description?: string }) | null> {
  const supabase = await createServerSupabaseClient();
  // First find the venue by slug
  const venueResult = await supabase.from('venues').select('*').eq('slug', venueSlug).maybeSingle();
  if (!venueResult.data) return null;

  const result = await supabase
    .from('contents')
    .select('*')
    .eq('venue_id', venueResult.data.id)
    .eq('language', language)
    .maybeSingle();
  if (result.error) throw new Error(`[getVenueContent] ${result.error.message}`);
  return result.data;
}

/** Fetch venue attributes (the JSONB field). */
export async function getVenueAttributes(
  venueSlug: string,
): Promise<Record<string, any> | null> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from('venues')
    .select('*')
    .eq('slug', venueSlug)
    .maybeSingle();
  if (result.error) throw new Error(`[getVenueAttributes] ${result.error.message}`);
  if (!result.data) return null;
  return {
    ...result.data.attributes,
    dress_code: result.data.dress_code,
    music_style: result.data.music_style,
    age_policy: result.data.age_policy,
    alcohol_policy: result.data.alcohol_policy,
  };
}

/** Fetch photos for a venue by slug. */
export async function getVenuePhotos(venueSlug: string): Promise<Photo[]> {
  const supabase = await createServerSupabaseClient();
  const venueResult = await supabase.from('venues').select('*').eq('slug', venueSlug).maybeSingle();
  if (!venueResult.data) return [];
  const result = await supabase
    .from('photos')
    .select('*')
    .eq('venue_id', venueResult.data.id)
    .order('order', { ascending: true });
  if (result.error) throw new Error(`[getVenuePhotos] ${result.error.message}`);
  return result.data ?? [];
}

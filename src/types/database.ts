// =============================================================================
// Database types for Supabase — Morocco Premium Nightlife Directory
// =============================================================================

// ---------------------------------------------------------------------------
// Core entity types (matching Supabase row shapes)
// ---------------------------------------------------------------------------

export type City = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  /** GeoJSON Point — coordinates are [longitude, latitude] */
  latlng: { type: string; coordinates: [number, number] };
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  priority: number;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Venue = {
  id: number;
  city_id: number;
  category_id: number;
  name: string;
  slug: string;
  neighborhood: string | null;
  address: string;
  /** GeoJSON Point — coordinates are [longitude, latitude] */
  latlng: { type: string; coordinates: [number, number] };
  whatsapp: string | null;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  price_range: '€€' | '€€€' | '€€€€';
  dress_code: string | null;
  music_style: string | null;
  age_policy: string | null;
  alcohol_policy: 'yes' | 'no';
  /** Arbitrary key/value pairs for flexible venue metadata */
  attributes: Record<string, any>;
  status: 'draft' | 'published';
  is_sponsored: boolean;
  priority_score: number;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueContent = {
  id: number;
  venue_id: number;
  language: 'fr' | 'en';
  description: string;
  seo_keywords: string[] | null;
};

export type Photo = {
  id: number;
  venue_id: number;
  url: string;
  alt: string | null;
  is_cover: boolean;
  order: number;
};

export type Collection = {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  description: string | null;
  venue_ids: number[];
};

// ---------------------------------------------------------------------------
// Joined / computed types used by API responses and UI components
// ---------------------------------------------------------------------------

/** Full venue payload with all related entities — used on detail pages. */
export type VenueWithDetails = Venue & {
  contents: VenueContent[];
  photos: Photo[];
  tags: Tag[];
  city?: City;
  category?: Category;
};

/** Lightweight card representation — used in list/grid views. */
export type VenueCard = Pick<
  Venue,
  'id' | 'name' | 'slug' | 'neighborhood' | 'price_range' | 'is_sponsored' | 'priority_score'
> & {
  cover_photo: string | null;
  /** Description in the current request language */
  description: string;
  category_slug: string;
  city_slug: string;
  tags: string[];
};

/** Result row returned by the `nearby_venues` Postgres function. */
export type NearbyVenue = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  distance_m: number;
};

/** Result row returned by the `search_venues` Postgres function. */
export type SearchVenueResult = {
  id: number;
  name: string;
  slug: string;
  neighborhood: string;
  rank: number;
};

// ---------------------------------------------------------------------------
// Aliases used by venue detail page
// ---------------------------------------------------------------------------

/** Alias for venue attributes record (used by venue detail page). */
export type VenueAttributes = Record<string, any> & {
  dress_code?: string | null;
  music_style?: string | null;
  age_policy?: string | null;
  alcohol_policy?: string | null;
};

/** Alias for Photo type (used by venue detail page). */
export type VenuePhoto = Photo;

// ---------------------------------------------------------------------------
// Supabase generated-style Database type for strong client typing
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: City;
        Insert: Omit<City, 'id' | 'created_at'>;
        Update: Partial<Omit<City, 'id'>>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'>;
        Update: Partial<Omit<Category, 'id'>>;
        Relationships: [];
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id'>;
        Update: Partial<Omit<Tag, 'id'>>;
        Relationships: [];
      };
      venues: {
        Row: Venue;
        Insert: Omit<Venue, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Venue, 'id'>>;
        Relationships: [];
      };
      contents: {
        Row: VenueContent;
        Insert: Omit<VenueContent, 'id'>;
        Update: Partial<Omit<VenueContent, 'id'>>;
        Relationships: [];
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, 'id'>;
        Update: Partial<Omit<Photo, 'id'>>;
        Relationships: [];
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, 'id'>;
        Update: Partial<Omit<Collection, 'id'>>;
        Relationships: [];
      };
      venues_tags: {
        Row: { venue_id: number; tag_id: number };
        Insert: { venue_id: number; tag_id: number };
        Update: { venue_id?: number; tag_id?: number };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      nearby_venues: {
        Args: { p_lat: number; p_lng: number; p_radius_m?: number };
        Returns: NearbyVenue[];
      };
      search_venues: {
        Args: { search_query: string; p_city_id?: number };
        Returns: SearchVenueResult[];
      };
    };
  };
};

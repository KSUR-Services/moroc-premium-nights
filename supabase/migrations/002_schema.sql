-- ============================================================================
-- Moroc Premium Nights - Migration 002: Schema
-- ============================================================================
-- Core database schema for the premium nightlife/dining directory MVP.
-- Covers cities, categories, tags, venues, content, photos, collections,
-- admin users, and audit logging.
-- ============================================================================


-- --------------------------------------------------------------------------
-- Cities
-- --------------------------------------------------------------------------
-- Seed with 4 cities at MVP: Casablanca, Rabat, Tangier, Marrakech.
-- Each city has a geographic point for map centering and proximity queries.

CREATE TABLE cities (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  latlng      GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_slug ON cities(slug);

COMMENT ON TABLE cities IS 'Top-level geographic entities. MVP seeds: Casablanca, Rabat, Tangier, Marrakech.';
COMMENT ON COLUMN cities.latlng IS 'City center point used for default map view and proximity calculations.';


-- --------------------------------------------------------------------------
-- Categories
-- --------------------------------------------------------------------------
-- Fixed set of venue types. Seed with 4 at MVP:
-- restaurants, lounges/rooftop_bars, nightclubs, beach_clubs.

CREATE TABLE categories (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  slug     TEXT UNIQUE NOT NULL,
  priority INT DEFAULT 0
);

COMMENT ON TABLE categories IS 'Venue classification. Fixed set managed by admins. Priority controls display order.';


-- --------------------------------------------------------------------------
-- Tags
-- --------------------------------------------------------------------------
-- Controlled vocabulary for venue attributes, 20-30 at MVP.
-- Examples: "live-dj", "shisha", "sea-view", "halal", "valet-parking".

CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

COMMENT ON TABLE tags IS 'Controlled tagging vocabulary (20-30 at MVP). Admin-managed, not user-generated.';


-- --------------------------------------------------------------------------
-- Venues
-- --------------------------------------------------------------------------
-- Core entity. Expected ~500 rows at MVP.
-- Uses JSONB attributes for flexible, filterable metadata.

CREATE TABLE venues (
  id              SERIAL PRIMARY KEY,
  city_id         INT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  category_id     INT REFERENCES categories(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  neighborhood    TEXT,
  address         TEXT NOT NULL,
  latlng          GEOGRAPHY(POINT, 4326) NOT NULL,
  whatsapp        TEXT,
  phone           TEXT,
  instagram       TEXT,
  website         TEXT,
  price_range     TEXT CHECK (price_range IN ('\u20ac\u20ac', '\u20ac\u20ac\u20ac', '\u20ac\u20ac\u20ac\u20ac')),
  dress_code      TEXT,
  music_style     TEXT,
  age_policy      TEXT,
  alcohol_policy  TEXT CHECK (alcohol_policy IN ('yes', 'no')),
  attributes      JSONB DEFAULT '{}',
  status          TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  is_sponsored    BOOLEAN DEFAULT FALSE,
  priority_score  INT DEFAULT 0,
  internal_notes  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Slug must be unique within a city (different cities can reuse slugs).
CREATE UNIQUE INDEX idx_venues_city_slug ON venues(city_id, slug);

-- Full-text search index on name + neighborhood for fast keyword queries.
CREATE INDEX idx_venues_search ON venues USING GIN(
  to_tsvector('simple', name || ' ' || COALESCE(neighborhood, ''))
);

-- GIN index on JSONB attributes for filtered queries (e.g. attributes->>'has_terrace').
CREATE INDEX idx_venues_attrs ON venues USING GIN(attributes);

-- Spatial index for proximity / bounding-box queries.
CREATE INDEX idx_venues_geo ON venues USING GIST(latlng);

-- Composite index for the most common listing query: published venues in a city, ordered by priority.
CREATE INDEX idx_venues_city_status ON venues(city_id, status, priority_score);

COMMENT ON TABLE venues IS 'Core venue entity (~500 rows at MVP). Represents a nightlife or dining establishment.';
COMMENT ON COLUMN venues.price_range IS 'Price tier indicator displayed to users.';
COMMENT ON COLUMN venues.attributes IS 'Flexible JSONB for filterable attributes (e.g. has_terrace, has_pool, reservation_required).';
COMMENT ON COLUMN venues.priority_score IS 'Manual ranking score. Higher values appear first in listings. Sponsored venues typically get a boost.';
COMMENT ON COLUMN venues.internal_notes IS 'Admin-only notes. Never exposed via public API or RLS.';


-- --------------------------------------------------------------------------
-- Venues <-> Tags (junction table)
-- --------------------------------------------------------------------------

CREATE TABLE venues_tags (
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  tag_id   INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (venue_id, tag_id)
);

COMMENT ON TABLE venues_tags IS 'Many-to-many relationship between venues and tags.';


-- --------------------------------------------------------------------------
-- Contents (multilingual venue descriptions)
-- --------------------------------------------------------------------------
-- One row per language per venue. MVP supports French (fr) and English (en).

CREATE TABLE contents (
  id           SERIAL PRIMARY KEY,
  venue_id     INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  language     TEXT NOT NULL CHECK (language IN ('fr', 'en')),
  description  TEXT NOT NULL,
  seo_keywords TEXT[],
  UNIQUE(venue_id, language)
);

COMMENT ON TABLE contents IS 'Multilingual venue descriptions. One row per language per venue (fr/en at MVP).';
COMMENT ON COLUMN contents.seo_keywords IS 'Array of keywords for SEO meta tags and internal search boosting.';


-- --------------------------------------------------------------------------
-- Photos
-- --------------------------------------------------------------------------
-- Multiple photos per venue. One can be marked as cover. Ordered for gallery display.

CREATE TABLE photos (
  id       SERIAL PRIMARY KEY,
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  url      TEXT NOT NULL,
  alt      TEXT,
  is_cover BOOLEAN DEFAULT FALSE,
  "order"  INT DEFAULT 0
);

CREATE INDEX idx_photos_venue_order ON photos(venue_id, "order");

COMMENT ON TABLE photos IS 'Venue photo gallery. One photo can be is_cover=true per venue (enforced at app level).';
COMMENT ON COLUMN photos."order" IS 'Display order within venue gallery. Lower numbers appear first.';


-- --------------------------------------------------------------------------
-- Collections (curated venue lists)
-- --------------------------------------------------------------------------
-- Editorially curated groupings, e.g. "Casablanca Rooftops", "Best Beach Clubs".
-- venue_ids is a simple integer array for lightweight ordering without a junction table.

CREATE TABLE collections (
  id          SERIAL PRIMARY KEY,
  city_id     INT REFERENCES cities(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  venue_ids   INTEGER[]
);

COMMENT ON TABLE collections IS 'Curated venue lists for editorial content and themed pages.';
COMMENT ON COLUMN collections.venue_ids IS 'Ordered array of venue IDs. Order determines display sequence.';


-- --------------------------------------------------------------------------
-- Admins
-- --------------------------------------------------------------------------
-- Minimal admin table linking to Supabase Auth. Roles managed at app level.

CREATE TABLE admins (
  id   UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL
);

COMMENT ON TABLE admins IS 'Admin users linked to Supabase Auth. Role examples: super_admin, editor, contributor.';


-- --------------------------------------------------------------------------
-- Audit Logs
-- --------------------------------------------------------------------------
-- Lightweight change tracking for venue edits. Stores before/after snapshots.

CREATE TABLE audit_logs (
  id        BIGSERIAL PRIMARY KEY,
  venue_id  INT REFERENCES venues(id),
  admin_id  UUID REFERENCES admins(id),
  action    TEXT,
  old_data  JSONB,
  new_data  JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Change history for venue modifications. Stores JSONB snapshots of old and new state.';

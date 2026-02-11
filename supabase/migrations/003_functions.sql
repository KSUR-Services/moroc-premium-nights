-- ============================================================================
-- Moroc Premium Nights - Migration 003: Functions & Triggers
-- ============================================================================
-- Database functions for:
--   1. Auto-updating updated_at timestamps on venue modifications
--   2. Proximity-based venue search (nearby_venues RPC)
--   3. Full-text keyword search across venues (search_venues RPC)
-- ============================================================================


-- --------------------------------------------------------------------------
-- 1. Auto-update updated_at trigger
-- --------------------------------------------------------------------------
-- Generic trigger function that sets updated_at = NOW() on every UPDATE.
-- Attached to the venues table; can be reused on other tables if needed.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Generic trigger function: sets updated_at = NOW() before each row update.';

CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- --------------------------------------------------------------------------
-- 2. Nearby venues RPC
-- --------------------------------------------------------------------------
-- Returns published venues within a given radius (default 5 km) of a point,
-- ordered by distance. Uses PostGIS ST_DWithin for index-accelerated filtering
-- and ST_Distance for exact distance calculation.
--
-- Usage from Supabase client:
--   const { data } = await supabase.rpc('nearby_venues', {
--     p_lat: 33.5731,
--     p_lng: -7.5898,
--     p_radius_m: 3000
--   });

CREATE OR REPLACE FUNCTION nearby_venues(
  p_lat       FLOAT,
  p_lng       FLOAT,
  p_radius_m  INT DEFAULT 5000
)
RETURNS TABLE (
  id          INT,
  name        TEXT,
  slug        TEXT,
  category_id INT,
  latlng      GEOGRAPHY,
  distance_m  FLOAT
) AS $$
  SELECT
    v.id,
    v.name,
    v.slug,
    v.category_id,
    v.latlng,
    ST_Distance(
      v.latlng::geography,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_m
  FROM venues v
  WHERE v.status = 'published'
    AND ST_DWithin(
      v.latlng::geography,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_m
    )
  ORDER BY distance_m;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION nearby_venues(FLOAT, FLOAT, INT) IS
  'Returns published venues within p_radius_m meters of (p_lat, p_lng), ordered by distance.';


-- --------------------------------------------------------------------------
-- 3. Full-text search RPC
-- --------------------------------------------------------------------------
-- Searches published venues by name and neighborhood using PostgreSQL
-- full-text search with the 'simple' configuration (language-agnostic).
-- Optionally filters by city. Returns results ranked by relevance.
--
-- Usage from Supabase client:
--   const { data } = await supabase.rpc('search_venues', {
--     search_query: 'sky bar',
--     p_city_id: 1
--   });

CREATE OR REPLACE FUNCTION search_venues(
  search_query  TEXT,
  p_city_id     INT DEFAULT NULL
)
RETURNS TABLE (
  id            INT,
  name          TEXT,
  slug          TEXT,
  neighborhood  TEXT,
  rank          REAL
) AS $$
  SELECT
    v.id,
    v.name,
    v.slug,
    v.neighborhood,
    ts_rank(
      to_tsvector('simple', v.name || ' ' || COALESCE(v.neighborhood, '')),
      plainto_tsquery('simple', search_query)
    ) AS rank
  FROM venues v
  WHERE v.status = 'published'
    AND to_tsvector('simple', v.name || ' ' || COALESCE(v.neighborhood, ''))
        @@ plainto_tsquery('simple', search_query)
    AND (p_city_id IS NULL OR v.city_id = p_city_id)
  ORDER BY rank DESC;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION search_venues(TEXT, INT) IS
  'Full-text search on venue name + neighborhood. Optional city filter. Returns results ranked by relevance.';

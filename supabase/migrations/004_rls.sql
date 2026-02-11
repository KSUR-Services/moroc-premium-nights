-- ============================================================================
-- Moroc Premium Nights - Migration 004: Row Level Security (RLS)
-- ============================================================================
-- Security model:
--   - Anonymous (public) users: READ access to published content only
--   - Authenticated admins: FULL access to all rows (verified via admins table)
--
-- The admin check uses: auth.uid() IN (SELECT id FROM admins)
-- This ensures only users with a row in the admins table get write access,
-- not just any authenticated Supabase user.
-- ============================================================================


-- ==========================================================================
-- Enable RLS on all tables
-- ==========================================================================
-- When RLS is enabled, all access is denied by default unless a policy
-- explicitly grants it. This is the secure-by-default approach.

ALTER TABLE cities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues        ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;


-- ==========================================================================
-- Helper: reusable admin check expression
-- ==========================================================================
-- We use (auth.uid() IN (SELECT id FROM admins)) throughout.
-- This is evaluated per-request and cached by the planner.


-- ==========================================================================
-- CITIES
-- ==========================================================================

-- Public: anyone can read all cities (they're all visible by design).
CREATE POLICY cities_public_read ON cities
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin: full CRUD access.
CREATE POLICY cities_admin_all ON cities
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- CATEGORIES
-- ==========================================================================

-- Public: anyone can read all categories.
CREATE POLICY categories_public_read ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin: full CRUD access.
CREATE POLICY categories_admin_all ON categories
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- TAGS
-- ==========================================================================

-- Public: anyone can read all tags.
CREATE POLICY tags_public_read ON tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin: full CRUD access.
CREATE POLICY tags_admin_all ON tags
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- VENUES
-- ==========================================================================

-- Public: only published venues are visible to anonymous and authenticated users.
CREATE POLICY venues_public_read ON venues
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admin: can see and modify ALL venues (including drafts).
-- This overrides the public read policy for admins.
CREATE POLICY venues_admin_all ON venues
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- VENUES_TAGS
-- ==========================================================================

-- Public: read junction rows only for published venues.
CREATE POLICY venues_tags_public_read ON venues_tags
  FOR SELECT
  TO anon, authenticated
  USING (
    venue_id IN (SELECT id FROM venues WHERE status = 'published')
  );

-- Admin: full CRUD access.
CREATE POLICY venues_tags_admin_all ON venues_tags
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- CONTENTS
-- ==========================================================================

-- Public: read content only for published venues.
CREATE POLICY contents_public_read ON contents
  FOR SELECT
  TO anon, authenticated
  USING (
    venue_id IN (SELECT id FROM venues WHERE status = 'published')
  );

-- Admin: full CRUD access.
CREATE POLICY contents_admin_all ON contents
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- PHOTOS
-- ==========================================================================

-- Public: read photos only for published venues.
CREATE POLICY photos_public_read ON photos
  FOR SELECT
  TO anon, authenticated
  USING (
    venue_id IN (SELECT id FROM venues WHERE status = 'published')
  );

-- Admin: full CRUD access.
CREATE POLICY photos_admin_all ON photos
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- COLLECTIONS
-- ==========================================================================

-- Public: anyone can read all collections.
CREATE POLICY collections_public_read ON collections
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin: full CRUD access.
CREATE POLICY collections_admin_all ON collections
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- ADMINS
-- ==========================================================================

-- Admins can read their own row (useful for role checks in the client).
CREATE POLICY admins_self_read ON admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Only existing admins can manage the admins table (add/remove other admins).
CREATE POLICY admins_admin_all ON admins
  FOR ALL
  TO authenticated
  USING   (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));


-- ==========================================================================
-- AUDIT LOGS
-- ==========================================================================

-- No public access at all. Audit logs are admin-only.
CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

-- Admins can insert audit log entries.
CREATE POLICY audit_logs_admin_insert ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

-- Audit logs are append-only: no UPDATE or DELETE policies.
-- This preserves the integrity of the audit trail.

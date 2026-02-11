-- ============================================================================
-- Moroc Premium Nights - Migration 005: Storage Buckets & Policies
-- ============================================================================
-- Sets up Supabase Storage for venue photography.
--
-- Bucket: venue-photos
--   - Public read access (images served via CDN)
--   - Authenticated admin write access (upload, update, delete)
--   - File size limit: 5 MB
--   - Allowed MIME types: JPEG, PNG, WebP
-- ============================================================================


-- --------------------------------------------------------------------------
-- Create the venue-photos storage bucket
-- --------------------------------------------------------------------------
-- public = true means files can be accessed without authentication via the
-- public URL: {supabase_url}/storage/v1/object/public/venue-photos/{path}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-photos',
  'venue-photos',
  true,
  5242880,  -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------------------------------
-- Storage RLS Policies
-- --------------------------------------------------------------------------
-- Supabase Storage uses the storage.objects table with RLS.
-- Policies filter on bucket_id to scope access to this bucket only.


-- Public read: anyone can view/download venue photos.
-- This enables direct image URLs for the frontend without auth tokens.
CREATE POLICY venue_photos_public_read ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'venue-photos');

-- Admin insert: only admins can upload new photos.
CREATE POLICY venue_photos_admin_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'venue-photos'
    AND auth.uid() IN (SELECT id FROM admins)
  );

-- Admin update: only admins can overwrite/replace existing photos.
CREATE POLICY venue_photos_admin_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'venue-photos'
    AND auth.uid() IN (SELECT id FROM admins)
  )
  WITH CHECK (
    bucket_id = 'venue-photos'
    AND auth.uid() IN (SELECT id FROM admins)
  );

-- Admin delete: only admins can remove photos.
CREATE POLICY venue_photos_admin_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'venue-photos'
    AND auth.uid() IN (SELECT id FROM admins)
  );

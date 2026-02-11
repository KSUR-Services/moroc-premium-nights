import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { venueSchema } from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Supabase Admin Client
// ──────────────────────────────────────────────

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ──────────────────────────────────────────────
// Auth check
// ──────────────────────────────────────────────

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get('moroc_admin_session');
  return !!cookie?.value;
}

// ──────────────────────────────────────────────
// Route context type
// ──────────────────────────────────────────────

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ──────────────────────────────────────────────
// GET /api/admin/venues/[id]
// Fetch a single venue with all relations
// ──────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = getSupabaseAdmin();

    // Fetch venue
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (venueError) {
      console.error('Venue fetch error:', venueError);
      return NextResponse.json(
        { error: 'Failed to fetch venue' },
        { status: 500 }
      );
    }

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    const [contentsRes, photosRes, tagsRes] = await Promise.all([
      supabase
        .from('venue_contents')
        .select('*')
        .eq('venue_id', id)
        .order('locale'),
      supabase
        .from('venue_photos')
        .select('*')
        .eq('venue_id', id)
        .order('sort_order'),
      supabase
        .from('venue_tags')
        .select('tag_id')
        .eq('venue_id', id),
    ]);

    const venueWithRelations = {
      ...venue,
      contents: contentsRes.data || [],
      photos: photosRes.data || [],
      tag_ids: (tagsRes.data || []).map((t: { tag_id: string }) => t.tag_id),
    };

    return NextResponse.json({ venue: venueWithRelations });
  } catch (error) {
    console.error('Venue GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/venues/[id]
// Update a venue (full or partial)
// ──────────────────────────────────────────────

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Check venue exists
    const { data: existing } = await supabase
      .from('venues')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // If this is a partial update (e.g., just status change), skip full validation
    const isPartialUpdate = Object.keys(body).length <= 3 && !body.contents;

    if (!isPartialUpdate) {
      const result = venueSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten() },
          { status: 400 }
        );
      }
    }

    // If slug changed, check uniqueness
    if (body.slug) {
      const { data: slugConflict } = await supabase
        .from('venues')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .maybeSingle();

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A venue with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Separate relational data
    const { contents, photos, tag_ids, ...venueData } = body;

    // Remove fields that should not be in the venues table update
    delete venueData.id;
    delete venueData.created_at;

    // Update venue record
    if (Object.keys(venueData).length > 0) {
      venueData.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('venues')
        .update(venueData)
        .eq('id', id);

      if (updateError) {
        console.error('Venue update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update venue', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // Update contents (delete + re-insert strategy)
    if (contents && Array.isArray(contents)) {
      await supabase.from('venue_contents').delete().eq('venue_id', id);

      if (contents.length > 0) {
        const contentRows = contents.map((content: {
          locale: string;
          description: string;
          seo_title?: string;
          seo_description?: string;
          seo_keywords?: string[];
        }) => ({
          venue_id: id,
          locale: content.locale,
          description: content.description,
          seo_title: content.seo_title || '',
          seo_description: content.seo_description || '',
          seo_keywords: content.seo_keywords || [],
        }));

        const { error: contentError } = await supabase
          .from('venue_contents')
          .insert(contentRows);

        if (contentError) {
          console.error('Content update error:', contentError);
        }
      }
    }

    // Update photos (delete + re-insert strategy)
    if (photos && Array.isArray(photos)) {
      await supabase.from('venue_photos').delete().eq('venue_id', id);

      if (photos.length > 0) {
        const photoRows = photos.map((photo: {
          url: string;
          alt?: string;
          is_cover?: boolean;
          sort_order?: number;
        }, index: number) => ({
          venue_id: id,
          url: photo.url,
          alt: photo.alt || '',
          is_cover: photo.is_cover || false,
          sort_order: photo.sort_order ?? index,
        }));

        const { error: photoError } = await supabase
          .from('venue_photos')
          .insert(photoRows);

        if (photoError) {
          console.error('Photo update error:', photoError);
        }
      }
    }

    // Update tag associations
    if (tag_ids && Array.isArray(tag_ids)) {
      await supabase.from('venue_tags').delete().eq('venue_id', id);

      if (tag_ids.length > 0) {
        const tagRows = tag_ids.map((tagId: string) => ({
          venue_id: id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('venue_tags')
          .insert(tagRows);

        if (tagError) {
          console.error('Tag update error:', tagError);
        }
      }
    }

    // Audit log
    const changes: string[] = [];
    if (body.status && body.status !== existing.name) changes.push(`status -> ${body.status}`);
    if (body.name && body.name !== existing.name) changes.push(`name -> ${body.name}`);

    await supabase.from('audit_logs').insert({
      action: 'updated',
      entity_type: 'venue',
      entity_id: id,
      entity_name: body.name || existing.name,
      details: changes.length > 0 ? changes.join(', ') : 'Venue details updated',
    }).then(
      () => {},
      (err: Error) => console.error('Audit log error:', err)
    );

    // Fetch updated venue
    const { data: updatedVenue } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json({
      venue: updatedVenue,
      message: 'Venue updated successfully',
    });
  } catch (error) {
    console.error('Venue PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/venues/[id]
// Delete a venue and all related data
// ──────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = getSupabaseAdmin();

    // Fetch venue name for audit log
    const { data: venue } = await supabase
      .from('venues')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Delete related data first (respects foreign keys)
    await Promise.all([
      supabase.from('venue_contents').delete().eq('venue_id', id),
      supabase.from('venue_photos').delete().eq('venue_id', id),
      supabase.from('venue_tags').delete().eq('venue_id', id),
    ]);

    // Remove from collections
    // (Update collections that contain this venue)
    const { data: collections } = await supabase
      .from('collections')
      .select('id, venue_ids')
      .contains('venue_ids', [id]);

    if (collections && collections.length > 0) {
      await Promise.all(
        collections.map((col) =>
          supabase
            .from('collections')
            .update({
              venue_ids: (col.venue_ids || []).filter((vid: string) => vid !== id),
            })
            .eq('id', col.id)
        )
      );
    }

    // Delete venue
    const { error: deleteError } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Venue delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete venue', details: deleteError.message },
        { status: 500 }
      );
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'deleted',
      entity_type: 'venue',
      entity_id: id,
      entity_name: venue.name,
      details: `Deleted venue "${venue.name}"`,
    }).then(
      () => {},
      (err: Error) => console.error('Audit log error:', err)
    );

    return NextResponse.json({
      message: `Venue "${venue.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('Venue DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

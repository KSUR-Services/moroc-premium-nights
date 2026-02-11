import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { venueSchema, venueFilterSchema } from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Supabase Admin Client (service role)
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
// Auth check helper
// ──────────────────────────────────────────────

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get('moroc_admin_session');
  return !!cookie?.value;
}

// ──────────────────────────────────────────────
// GET /api/admin/venues
// List venues with filters, sorting, pagination
// Also supports ?stats=true for dashboard stats
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Dashboard stats mode
  if (searchParams.get('stats') === 'true') {
    return handleGetStats();
  }

  // Parse filter params
  const filterResult = venueFilterSchema.safeParse({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || undefined,
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status') || undefined,
    sort_by: searchParams.get('sort_by') || 'updated_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    per_page: parseInt(searchParams.get('per_page') || '25'),
  });

  if (!filterResult.success) {
    return NextResponse.json(
      { error: 'Invalid filter parameters', details: filterResult.error.flatten() },
      { status: 400 }
    );
  }

  const filters = filterResult.data;

  try {
    const supabase = getSupabaseAdmin();

    // Build query
    let query = supabase
      .from('venues')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Sorting
    query = query.order(filters.sort_by!, { ascending: filters.sort_order === 'asc' });

    // Pagination
    const from = (filters.page! - 1) * filters.per_page!;
    const to = from + filters.per_page! - 1;
    query = query.range(from, to);

    const { data: venues, count, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch venues', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      venues: venues || [],
      total: count || 0,
      page: filters.page,
      per_page: filters.per_page,
    });
  } catch (error) {
    console.error('Venues GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/venues
// Create a new venue with contents, tags, photos
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate
    const result = venueSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = getSupabaseAdmin();

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from('venues')
      .select('id')
      .eq('slug', data.slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: 'A venue with this slug already exists' },
        { status: 409 }
      );
    }

    // Separate relational data
    const { contents, photos, tag_ids, attributes, ...venueData } = data;

    // Insert venue
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .insert({
        ...venueData,
        attributes: attributes || {},
      })
      .select()
      .single();

    if (venueError) {
      console.error('Venue insert error:', venueError);
      return NextResponse.json(
        { error: 'Failed to create venue', details: venueError.message },
        { status: 500 }
      );
    }

    const venueId = venue.id;

    // Insert contents
    if (contents && contents.length > 0) {
      const contentRows = contents.map((content) => ({
        venue_id: venueId,
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
        console.error('Content insert error:', contentError);
        // Don't fail the whole request, log and continue
      }
    }

    // Insert photos
    if (photos && photos.length > 0) {
      const photoRows = photos.map((photo, index) => ({
        venue_id: venueId,
        url: photo.url,
        alt: photo.alt || '',
        is_cover: photo.is_cover || false,
        sort_order: photo.sort_order ?? index,
      }));

      const { error: photoError } = await supabase
        .from('venue_photos')
        .insert(photoRows);

      if (photoError) {
        console.error('Photo insert error:', photoError);
      }
    }

    // Insert tag associations
    if (tag_ids && tag_ids.length > 0) {
      const tagRows = tag_ids.map((tagId) => ({
        venue_id: venueId,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('venue_tags')
        .insert(tagRows);

      if (tagError) {
        console.error('Tag insert error:', tagError);
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      action: 'created',
      entity_type: 'venue',
      entity_id: venueId,
      entity_name: data.name,
      details: `Created venue "${data.name}" in ${data.city}`,
    }).then(
      () => {},
      (err: Error) => console.error('Audit log error:', err)
    );

    return NextResponse.json(
      { venue, message: 'Venue created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Venues POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// Stats helper
// ──────────────────────────────────────────────

async function handleGetStats() {
  try {
    const supabase = getSupabaseAdmin();

    // Get venue counts by status
    const { data: venues, error } = await supabase
      .from('venues')
      .select('id, status, city, is_sponsored');

    if (error) {
      console.error('Stats query error:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const allVenues = venues || [];

    const stats = {
      total_venues: allVenues.length,
      published: allVenues.filter((v) => v.status === 'published').length,
      draft: allVenues.filter((v) => v.status === 'draft').length,
      archived: allVenues.filter((v) => v.status === 'archived').length,
      sponsored: allVenues.filter((v) => v.is_sponsored).length,
      by_city: allVenues.reduce(
        (acc, v) => {
          acc[v.city] = (acc[v.city] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      total_collections: 0,
    };

    // Get collection count
    const { count: collectionCount } = await supabase
      .from('collections')
      .select('id', { count: 'exact', head: true });

    stats.total_collections = collectionCount || 0;

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

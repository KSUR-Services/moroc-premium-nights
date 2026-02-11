import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { collectionSchema } from '@/lib/validations/venue';

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
// GET /api/admin/collections
// List all collections, optionally filtered by city
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const search = searchParams.get('search');
  const isActive = searchParams.get('is_active');

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('collections')
      .select('*')
      .order('city')
      .order('sort_order', { ascending: true });

    if (city) {
      query = query.eq('city', city);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: collections, error } = await query;

    if (error) {
      console.error('Collections fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch collections', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ collections: collections || [] });
  } catch (error) {
    console.error('Collections GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/collections
// Create a new collection
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate
    const result = collectionSchema.safeParse(body);
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
      .from('collections')
      .select('id')
      .eq('slug', data.slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: 'A collection with this slug already exists' },
        { status: 409 }
      );
    }

    // Get next sort order for this city
    const { data: lastCollection } = await supabase
      .from('collections')
      .select('sort_order')
      .eq('city', data.city)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortOrder = lastCollection ? lastCollection.sort_order + 1 : 0;

    // Insert collection
    const { data: collection, error: insertError } = await supabase
      .from('collections')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        city: data.city,
        venue_ids: data.venue_ids || [],
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? nextSortOrder,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Collection insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create collection', details: insertError.message },
        { status: 500 }
      );
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'created',
      entity_type: 'collection',
      entity_id: collection.id,
      entity_name: data.name,
      details: `Created collection "${data.name}" for ${data.city}`,
    }).then(
      () => {},
      (err: Error) => console.error('Audit log error:', err)
    );

    return NextResponse.json(
      { collection, message: 'Collection created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Collections POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/admin/collections?id=xxx
// Update an existing collection
// ──────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Collection ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Check collection exists
    const { data: existing } = await supabase
      .from('collections')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // If slug changed, check uniqueness
    if (body.slug) {
      const { data: slugConflict } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .maybeSingle();

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A collection with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.venue_ids !== undefined) updateData.venue_ids = body.venue_ids;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    updateData.updated_at = new Date().toISOString();

    const { data: collection, error: updateError } = await supabase
      .from('collections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Collection update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update collection', details: updateError.message },
        { status: 500 }
      );
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'updated',
      entity_type: 'collection',
      entity_id: id,
      entity_name: body.name || existing.name,
      details: `Updated collection "${body.name || existing.name}"`,
    }).then(
      () => {},
      (err: Error) => console.error('Audit log error:', err)
    );

    return NextResponse.json({
      collection,
      message: 'Collection updated successfully',
    });
  } catch (error) {
    console.error('Collections PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// DELETE /api/admin/collections?id=xxx
// Delete a collection
// ──────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Collection ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // Fetch collection for audit log
    const { data: collection } = await supabase
      .from('collections')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Delete
    const { error: deleteError } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Collection delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete collection', details: deleteError.message },
        { status: 500 }
      );
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'deleted',
      entity_type: 'collection',
      entity_id: id,
      entity_name: collection.name,
      details: `Deleted collection "${collection.name}"`,
    }).then(
      () => {},
      (err: Error) => console.error('Audit log error:', err)
    );

    return NextResponse.json({
      message: `Collection "${collection.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('Collections DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

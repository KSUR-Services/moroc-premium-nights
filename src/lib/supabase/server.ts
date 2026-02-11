// =============================================================================
// Server-side Supabase clients (Server Components, Route Handlers, Actions)
// =============================================================================
// Two factory functions are exported:
//
//   createServerSupabaseClient()  — uses the visitor's cookies (anon key).
//                                   Respects RLS; safe for read operations
//                                   that depend on the current user session.
//
//   createAdminClient()           — uses the service-role key.
//                                   Bypasses RLS; used for trusted write
//                                   operations (admin panel, webhooks, etc.).
// =============================================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Server-side Supabase client that inherits the current user session from
 * cookies. Works in Server Components, Route Handlers and Server Actions.
 *
 * This function is `async` because Next.js 15+ requires `await cookies()`.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from Server Components where writing cookies
            // is not allowed. The try/catch is intentional — the cookie will
            // be set by the middleware instead.
          }
        },
      },
    },
  );
}

/**
 * Admin Supabase client that uses the **service-role key**.
 *
 * This client bypasses all Row-Level Security policies. Only use it in
 * trusted server-side contexts (admin API routes, background jobs, etc.).
 * Never expose the service-role key to the browser.
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}

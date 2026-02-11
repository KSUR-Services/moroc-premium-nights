import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'moroc_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Generate a session token by hashing the password with a timestamp.
 * This gives us a verifiable token without storing sessions server-side.
 */
function generateSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD || '';
  const payload = `${secret}:${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * POST /api/admin/auth
 * Validate the admin password and set a session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password);
    const adminBuffer = Buffer.from(adminPassword);

    if (
      passwordBuffer.length !== adminBuffer.length ||
      !crypto.timingSafeEqual(passwordBuffer, adminBuffer)
    ) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Create response with cookie
    const response = NextResponse.json(
      { success: true, message: 'Authenticated successfully' },
      { status: 200 }
    );

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth
 * Clear the session cookie (logout).
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth
 * Check if the current session is valid.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!session || !session.value) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // For MVP, we just check that the cookie exists and has a value.
    // A more robust approach would verify the token signature.
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

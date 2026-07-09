import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_KEY, PUBLIC_ROUTES, AUTH_ROUTE } from '@/lib/constants';

/**
 * Decode a JWT payload without verifying the signature.
 * Middleware runs on the Edge runtime, so we cannot use jsonwebtoken.
 * Signature verification is done on the backend for every protected API call.
 */
function decodeJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    );
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = decodeJwtExpiry(token);
  if (exp === null) return true; // Treat unreadable tokens as expired
  // Add a 10-second buffer to avoid edge-case races
  return Date.now() / 1000 >= exp - 10;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through (root + any /auth/* path)
  const isPublic =
    pathname === '/' ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(TOKEN_KEY)?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL(AUTH_ROUTE, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Expired token → clear cookie and redirect to login
  if (isTokenExpired(token)) {
    const loginUrl = new URL(AUTH_ROUTE, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('reason', 'session_expired');
    const response = NextResponse.redirect(loginUrl);
    // Clear the stale cookie so the next request is clean
    response.cookies.set(TOKEN_KEY, '', { maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
};

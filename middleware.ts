import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Inlined from @/lib/constants — Edge Runtime cannot resolve path aliases
const TOKEN_KEY = 'finsense_token';
const PUBLIC_ROUTES = ['/auth'] as const;
const AUTH_ROUTE = '/auth';

/**
 * Decode a JWT payload without verifying the signature.
 * Middleware runs on the Edge runtime, so we cannot use jsonwebtoken.
 * Signature verification is done on the backend for every protected API call.
 */
function decodeJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
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

  const token = request.cookies.get(TOKEN_KEY)?.value;

  if (isPublic) {
    if (token && !isTokenExpired(token) && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }


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

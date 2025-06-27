import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // If authenticated, prevent access to login/register
  if (
    token &&
    (request.nextUrl.pathname === '/auth/login' ||
      request.nextUrl.pathname === '/auth/register')
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect all routes except auth pages, static files, and home page
  if (
    !token &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

// Optionally, configure which routes to protect
export const config = {
  matcher: [
    // Protect everything except /auth/*
    '/((?!_next|public).*)',
  ],
};

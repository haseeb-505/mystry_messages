import { NextRequest, NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET // Explicitly provide the secret
  });
  
  const url = request.nextUrl;
  // console.log('Middleware - Token:', token, 'Path:', url.pathname);

  // Public routes
  const publicRoutes = ['/sign-in', '/sign-up', '/verify'];
  
  // Redirect authenticated users away from auth pages
  if (token && publicRoutes.some(route => url.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sign-in',
    '/sign-up',
    '/verify/:path*'
  ]
};
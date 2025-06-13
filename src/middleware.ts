import { NextRequest, NextResponse } from 'next/server'
 
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = await getToken({req: request});
    const url = request.nextUrl;
    
    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify') ||
        url.pathname.startsWith('/')
    )) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Allow unauthenticated users to access sign-in, sign-up, and verify routes
    if (
        !token &&
        (url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify'))
    ) {
        return NextResponse.next(); // Proceed to the requested route
    }
    
    // Redirect unauthenticated users to /home for all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    // Allow authenticated users to access other routes (e.g., /dashboard)
    return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/signIn',
    '/signUp',
    '/',
    '/dashboard/:path*',
    '/verify/:path*'
    ]
}
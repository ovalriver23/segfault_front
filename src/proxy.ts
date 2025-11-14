import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'
 
// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard','dashboard/staff','dashboard/menu','dashboard/settings','dashboard/tables','dashboard/stats']
const publicRoutes = ['/log-in', '/sign-up', '/']
 
export default async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('JWT_TOKEN')?.value
 
  // 4. Verify JWT token if it exists
  if (cookie) {
    try {
      // Decode the token (no network request, takes milliseconds)
      const claims = decodeJwt(cookie);
      
      // Check expiration (exp is in seconds, Date.now() is in milliseconds)
      if (claims.exp && claims.exp * 1000 < Date.now()) {
        // Token expired!
        return NextResponse.redirect(new URL('/log-in', req.nextUrl));
      }
      
      // NOTE: We don't verify the signature here. The user could have manually modified the token.
      // But that's okay! Even if they access the dashboard with a fake token,
      // the backend will verify the signature when fetching data and return 401.
      // The middleware's purpose is only to filter out "obvious" invalid tokens.

    } catch (err) {
      // If token is malformed, redirect to login
      return NextResponse.redirect(new URL('/log-in', req.nextUrl));
    }
  }

  // 5. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL('/log-in', req.nextUrl))
  }
  
 
  // 6. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    cookie &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Proxy should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
 
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
 
  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
 
  // 5. Redirect to /dashboard if the user is authenticated
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
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'

// 1. Specify protected and authentication routes
const managerRoutes = ['/dashboard', '/dashboard/staff', '/dashboard/menu', '/dashboard/settings', '/dashboard/tables', '/dashboard/stats', '/dashboard/settings/change-password']
const staffRoutes = ['/waiter/tables', '/waiter/notifications', '/waiter/profile', '/waiter/change-password']
const superadminRoutes = ['/Superadmin', '/Superadmin/restaurants', '/Superadmin/pending', '/Superadmin/map', '/Superadmin/statistics']
const authRoutes = ['/log-in', '/sign-up', '/waiter/login']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isManagerRoute = managerRoutes.some(route => path === route || path.startsWith(route + '/'))
  const isStaffRoute = staffRoutes.some(route => path === route || path.startsWith(route + '/'))
  const isSuperadminRoute = superadminRoutes.some(route => path === route || path.startsWith(route + '/'))
  const isProtectedRoute = isManagerRoute || isStaffRoute || isSuperadminRoute
  const isAuthRoute = authRoutes.includes(path)

  const cookie = (await cookies()).get('JWT_TOKEN')?.value
  let isAuthenticated = false

  if (cookie) {
    try {
      const claims = decodeJwt(cookie)

      // Check expiration
      if (!claims.exp || claims.exp * 1000 >= Date.now()) {
        isAuthenticated = true
      }

      // Note: Role-based access control is handled in layout components
      // because JWT doesn't contain role information
    } catch {
      isAuthenticated = false
    }
  }

  // Authenticated users should not revisit login or sign-up pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    if (isStaffRoute) {
      return NextResponse.redirect(new URL('/waiter/login', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/log-in', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

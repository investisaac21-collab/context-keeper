import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Protect app routes (require login)
  const protectedPrefixes = ['/dashboard', '/profiles', '/lab', '/forge', '/account', '/contexts']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect logged-in users away from login/landing
  if (session && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/profiles/:path*', '/lab/:path*', '/forge/:path*', '/account/:path*', '/contexts/:path*'],
}
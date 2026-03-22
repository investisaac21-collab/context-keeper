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
  const protectedPrefixes = ['/dashboard', '/profiles', '/lab', '/forge', '/account', '/contexts', '/onboarding']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/login', '/signup', '/register']
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Handle keeper.forum domain routing
  const host = req.headers.get('host') || ''
  if (host === 'keeper.forum' && pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)']
}

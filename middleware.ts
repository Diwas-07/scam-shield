import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    )
  }

  // Check admin access
  if (isAdminPage && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/report/:path*', '/admin/:path*', '/login', '/register']
}

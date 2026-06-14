import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('habexa_admin')?.value
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')

  if (isApiRoute) return NextResponse.next()

  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    if (isLoginPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|favicon).*)'] }

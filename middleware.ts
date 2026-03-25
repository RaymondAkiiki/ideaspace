import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'ideaspace_token'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', req.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ['/portal/:path*'],
}

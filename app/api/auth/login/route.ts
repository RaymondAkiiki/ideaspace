import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import { signToken, COOKIE_NAME, MAX_AGE } from '@/lib/auth'

function sha256(input: string): Buffer {
  return createHash('sha256').update(input).digest()
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error('[login] Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Timing-safe comparison — prevents timing attacks
    const emailMatch = email === adminEmail
    const passwordHash = sha256(password)
    const storedHash = sha256(adminPassword)
    const passwordMatch = timingSafeEqual(passwordHash, storedHash)

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signToken({ email })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
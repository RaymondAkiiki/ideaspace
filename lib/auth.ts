import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export const COOKIE_NAME = 'ideaspace_token'
export const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: { email: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as { email: string; iat: number; exp: number }
  } catch {
    return null
  }
}

// Server component usage (reads from cookie store)
export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Middleware / route handler usage (reads from request)
export async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

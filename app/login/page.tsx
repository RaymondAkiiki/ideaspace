'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/portal'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
        return
      }

      router.push(from)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl text-ink font-medium tracking-tight">
            Ideaspace
          </Link>
          <p className="font-mono text-xs text-ink-3 tracking-widest uppercase mt-2">
            Portal access
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] text-ink-3 tracking-widest uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-ink-3 tracking-widest uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-surface font-mono text-xs tracking-widest uppercase py-3.5 rounded-lg hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="font-mono text-xs text-ink-3 hover:text-ink transition-colors uppercase tracking-widest">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}

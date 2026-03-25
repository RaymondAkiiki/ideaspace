'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function PortalNav() {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-serif text-xl text-ink font-medium tracking-tight hover:text-accent transition-colors"
          >
            Ideaspace
          </Link>
          <span className="text-border select-none">·</span>
          <span className="font-mono text-xs text-ink-3 tracking-wider uppercase">Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className={`font-mono text-xs uppercase tracking-wider transition-colors ${
              pathname === '/portal' ? 'text-ink' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Ideas
          </Link>
          <Link
            href="/portal/ideas/new"
            className="bg-accent hover:bg-accent/90 text-white font-mono text-xs tracking-wider uppercase px-3 py-1.5 rounded transition-colors"
          >
            + New
          </Link>
          <button
            onClick={handleLogout}
            className="font-mono text-xs text-ink-3 hover:text-ink uppercase tracking-wider transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}

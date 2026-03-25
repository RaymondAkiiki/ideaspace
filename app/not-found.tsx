import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <p className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-4">404</p>
      <h1 className="font-serif text-3xl text-ink font-medium mb-3">Page not found</h1>
      <p className="text-ink-3 text-sm mb-8">This idea doesn&apos;t exist or hasn&apos;t been published.</p>
      <Link
        href="/"
        className="font-mono text-xs text-ink-3 hover:text-accent transition-colors uppercase tracking-widest"
      >
        ← Back home
      </Link>
    </div>
  )
}
